var coap = require('coap');
var request = coap.request;
var URL = require('url');
var method = 'GET'; // default
var url;
var req;
var spawn = require('threads').spawn;
var Sensor;

var self = this;

module.exports.configDB = function(cfg){
  Sensor = require('./models/modelObj').Sensor;
  Sensor = new Sensor(cfg);
};

module.exports.serverListening = function(sock){
  console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);
  sock.on('data', function(data) {
    console.log('DATA ' + sock.remoteAddress + ': ' + data);
    setTimeout(function(){
      sock.write(JSON.stringify({aa:cont, zz:cont++}));
  }, 3000);
});
  sock.on('close', function(data) {
    console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
});
};


module.exports.getdataFromSensor = function(req, res) {
    var endereco = req.params.endereco === "undefined" ? "" : req.params.endereco, 
    folder = req.params.folder === "undefined" ? "" : req.params.folder, 
    resource = req.params.resource === "undefined" ? "" : req.params.resource, 
    params = req.params.params === "undefined" ? "" : req.params.params, 
    payload = req.params.payload === "undefined" ? "" : req.params.payload, 
    mMethod = req.params.mMethod === "undefined" ? "GET" : req.params.mMethod, 
    mObserve = req.params.mObserve === "undefined" ? "" : req.params.mObserve;

    resource = resource.replace("§","?");

    gatSensorDaata(endereco, folder, resource, params, payload, mMethod, mObserve, res);
};

module.exports.threadgetdataFromSensor = function(req, res ) {
    var endereco = req.params.endereco === "undefined" ? "" : req.params.endereco, 
    folder = req.params.folder === "undefined" ? "" : req.params.folder, 
    resource = req.params.resource === "undefined" ? "" : req.params.resource, 
    params = req.params.params === "undefined" ? "" : req.params.params, 
    payload = req.params.payload === "undefined" ? "" : req.params.payload, 
    mMethod = req.params.mMethod === "undefined" ? "GET" : req.params.mMethod, 
    mObserve = req.params.mObserve === "undefined" ? "" : req.params.mObserve;

    resource = resource.replace(/§/g,"?");

    thread = spawn(function(input, done) {
        done({
            endereco: input.endereco,
            folder: input.folder,
            resource: input.resource,
            params: input.params,
            payload: input.payload,
            mMethod: input.mMethod,
            mObserve: input.mObserve
        });
    });

    thread.send({
        endereco: endereco,
        folder: folder,
        resource: resource,
        params: params,
        payload: payload,
        mMethod: mMethod,
        mObserve: mObserve

        // The handlers come here: (none of them is mandatory) 
    }).on('message', function(response) {

        gatSensorDaata(endereco, folder, resource, params, payload, mMethod, mObserve, res);

    }).on('error', function(error) {
        console.error('Worker errored:', error);

    }).on('exit', function() {
        console.log('Worker has been terminated.');
    });

};

var gatSensorDaata = function(endereco, folder, resource, params, payload, mMethod, mObserve, response){
    var requestString = 'coap://' + endereco + ':5683/' + folder + '/' + resource + params;
    console.log(requestString);

    /*Sensor.insertData({
        name:"a", 
        ip: "asd.asdf.asf.asdf", 
        value: "12", 
        date: new Date()
    })*/

    url = URL.parse(requestString);
    url.method = mMethod;
    url.observe = mObserve;
    url.confirmable = false;

    coap.parameters.exchangeLifetime = 30;

    req = request(url);

    req.on('response', function(res) {
        res.setEncoding('utf8');
        console.log('chegou uma resposta');

        res.on('data', function(msg) {
            console.log(msg);
            response.json(msg);
        })
        // print only status code on empty response
        if (!res.payload.length) {
            process.stderr.write('\x1b[1m(' + res.code + ')\x1b[0m\n');
            console.log(res.payload);
            response.json(res.payload);
        }
    })

    if (method === 'GET' || method === 'DELETE' || payload) {
        req.end(payload);
    } else {
        process.stdin.pipe(req);
    }
};