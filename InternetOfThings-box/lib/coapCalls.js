require('colors');
var coap = require('coap'),
http = require('http'),
URL = require('url'),
http = require('http'),
CryptoJS = require("crypto-js"),
Sensor = require('./models/sensor.js'),
Route = require('./models/route.js'),
key = CryptoJS.enc.Hex.parse('B007AFD752937AFF5A4192268A803BB7'),
replaceRegex = /\u0000/gi;
var util = require('util');

Sensor = new Sensor();
Route = new Route();

module.exports = {
    serverListening: function(sock) {
        var self = this;
        console.log('CONNECTED: %s:%s'.italic.rainbow, sock.remoteAddress, sock.remotePort);

        sock.on('data', function(data) {
            // console.log('DATA ' + sock.remoteAddress + ': ' + data);
            try {
                var req = JSON.parse(data);
                module.exports[req.request](req, sock);

            } catch (e) {
                log.appendToLog("Invalid args - " + e, data.toString('utf8'));
                console.log("Invalid args - " + e, data.toString('utf8'));
            }
        });
        sock.on('close', function(data) {
            console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
        });
    },
    getValuesFromSensors: function() {
        Route.getAllAdressDistinct(callMoteFunctions);
    },
    getdataFromSensor: function(req, res) {
        var endereco = req.params.moteIp === "undefined" ? "" : req.params.moteIp,
        folder = req.params.folder === "undefined" ? "" : req.params.folder,
        resource = req.params.resource === "undefined" ? "" : req.params.resource,
        params = req.params.params === "undefined" ? "" : req.params.params,
        payload = req.params.payload === "undefined" ? "" : req.params.payload,
        mMethod = req.params.mMethod === "undefined" ? "GET" : req.params.mMethod,
        mObserve = req.params.mObserve === "undefined" ? "" : req.params.mObserve;

        resource = resource.replace("§", "?");
        getdataFromSensorReq(endereco, folder, resource, params, payload, mMethod, mObserve, key, res);
    },

    single_mote_all_info: function(req, res) {
        console.log(req.params.moteIp);
        getdataFromSensorReq(req.params.moteIp, 'data', "AllValues", '', undefined, 'GET', true, key, res);
    },

    single_mote_single_info: function(req, res) {
        console.log(req.params.moteIp, req.params.resource);
        getdataFromSensorReq(req.params.moteIp, 'data', req.params.resource, '', undefined, 'GET', true, key, res);
    },

    mote_action: function(req, res) {
        console.log(req.params.moteIpreq.params.resource, req.params.color, req.params.mode);
        getdataFromSensorReq(req.params.moteIp, 'actuators', req.params.resource, '?leds=' + req.params.color
            , 'mode=' + req.params.mode, 'POST', false, key, res);
    }
};


var getdataFromSensorReq = function(endereco, folder, resource, params, payload, mMethod, mObserve, key, response) {

    var req,
    request = coap.request,
    url,
    delayMillis = 3000,
    method = 'GET',
        // requestString = 'coap://[aaaa::212:4b00:60d:b305]:5683/test/hello';
        requestString = 'coap://' + endereco + ':5683/' + folder + '/' + resource + params;
        mKey = key;

        console.log(requestString);

        url = URL.parse(requestString);
        url.method = mMethod;
        url.observe = mObserve;
        url.confirmable = false;

        coap.parameters.exchangeLifetime = 30;

        req = request(url);
        if (!mObserve) {
            req.setOption('Block2', new Buffer([0x02]));
        }

        req.on('response', function(res) {
            res.setEncoding('utf8');

            var data = CryptoJS.enc.Hex.parse(res.payload.toString("hex"));

            var encrypted = {};
            encrypted.key = mKey;
            encrypted.ciphertext = data;

            var decrypted3 = CryptoJS.AES.decrypt(encrypted, mKey, {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.NoPadding
            });
            try {
            //console.log(CryptoJS.enc.Utf8.stringify(decrypted3));
            // console.log(CryptoJS.enc.Hex.stringify(decrypted3));
            // console.log(CryptoJS.enc.Utf8.stringify(decrypted3));

            if (response instanceof http.ServerResponse) {
                response.json(CryptoJS.enc.Utf8.stringify(decrypted3).replace(replaceRegex, ''));
            } else if (typeof response === "object") {
                response.write(JSON.stringify(CryptoJS.enc.Utf8.stringify(decrypted3).replace(replaceRegex, '')));
            } else {
                response(CryptoJS.enc.Utf8.stringify(decrypted3));
            }
        } catch (err) {
            if (response instanceof http.ServerResponse) {
                response.send(err);
            } else if (typeof response === "object") {
                response.write(JSON.stringify(err));
            } else {
                response(JSON.stringify(err));
            }
        }
        res.on('data', function(msg) {
            // console.log('Data:', msg);
            // console.log('Data:',CryptoJS.enc.Utf8.stringify(msg));
        })


        // print only status code on empty response
        try {
            if (!res.payload.length) {
                process.stderr.write('\x1b[1m(' + res.code + ')\x1b[0m\n');
                console.log(res.payload);
                console.log("Teste - " + res.payload);
                if (response instanceof http.ServerResponse) {
                    response.json(res.payload);
                } else if (typeof response === "object") {
                    response.write(JSON.stringify(res.payload));
                } else {
                    response(JSON.stringify(res.payload));
                }
            }
        } catch (e) {
            console.log("payload error - " + e);
        }
    });

        if (method === 'GET' || method === 'DELETE' || payload) {
            req.end(payload);
        } else {
            process.stdin.pipe(req);
        }
    }

    function removeProbChars(data) {
        var normalString = "";
        for (var x = 0; x < data.length; ++x) {
            var c = data.charCodeAt(x);
            if (c >= 0 && c <= 31) {
            //console.log( 'problematic character found at position ' + x);
            normalString = data.substring(0, x);
            break;
        } else {
            //console.log(data[x]);     
        }
    }
    return normalString;
}

var callMoteFunctions = function(routes) {
    for (var i in routes) {
        try {
            getdataFromSensorReq(routes[i], "data", "AllValues", "", "", "GET", false, key, function(data) {

                try {
                    data = removeProbChars(data);
                    var obJson = JSON.parse(data).Sensors;

                    /****************** O INSERT FUNCIONA ******************/
                    var obj = {
                        ip: routes[i],
                        dataVals : {
                            readingDate : Date.now(),
                            temperature: (Math.random() * 100).toFixed(2), //(obJson.Temperature.toString() == "00.-1") ? "-1" : obJson.Temperature,
                            humidity: (Math.random() * 100).toFixed(2), //(obJson.Humidity.toString() == "00.-1") ? "-1" : obJson.Humidity,
                            loudness: (Math.random() * 100).toFixed(2), //(obJson.Loudness.toString() == "00.-1") ? "-1" : obJson.Loudness,
                            light: (Math.random() * 100).toFixed(2), //(obJson.Light.toString() == "00.-1") ? "-1" : obJson.Light
                        }
                    }

                    // console.log("\nSimular insert:\n", obj);
                    Sensor.insertOrUpdate(obj);
                    /********************************************************/

                } catch (e) {
                    console.error(e);
                }
            });
            //try fim do for
        } catch (e) { 
            console.error(e); 
        }
        // *************************** New Call Get all Metodos *******************
        try {
            getdataFromSensorReq(routes[i], ".well-known", "core", "", "", "GET", false, key, function(data) { 
                try {
                    console.log(data);
                    var metodosReceive = getMoteMethods(routes[i], data);
                    console.log(util.inspect(metodosReceive, false, null, true));
                    Sensor.insertSensorMetodos(metodosReceive.ip, metodosReceive);
                } catch (e) {
                    console.error(e);
                }
            });
        } catch (e) { 
            console.error(e); 
        }
    }
}

var getMoteMethods = function(ipDoMote, data){
    // resource/.well-known/core
    //Trocar isto pela chamada da função getdatalalalalas
    //ou seja, chamar a função e enviar para aqui por param (data) os dados desencriptados
    // var data = '</.well-known/core>;ct=40,</test/ola>;title="Olá Mundo1: ?len=0..";rt="Text",</test/hello>;title="Hello world: ?len=0..";rt="Text",</actuators/leds>;title="LEDs: ?color=r|g|b, POST/PUT mode=on|off";rt="Control",</actuators/toggle>;title="Red LED";rt="Control",</sensors/button>;title="Event demo";obs,</test/separate>;title="Separate demo",</test/push>;title="Periodic demo";obs,</test/sub>;title="Sub-resource demo",</sensors/sht25>;title="Temperature and Humidity";rt="SHT25",</sensors/zoul>;title="Zoul on-board sensors";rt="zoul"',
    //Para chamar a função usar isto:
    //GET
    //FOLDER: .well-known
    //RESOURCE: core
    // requestString = 'coap://[aaaa::212:4b00:60d:b305]:5683/.well-known/core';
    // var getdataFromSensorReq = function("[aaaa::212:4b00:60d:b305]", ".well-known", "core", "", "", "GET", "", "", "") {

        resSplit = data.split(','),
        values = [];
        for(var i = 0; i < resSplit.length; i++){
            if(resSplit[i].startsWith("<")){
                var lastIndex = resSplit[i].lastIndexOf('>');
                values.push(resSplit[i].substr(1, lastIndex));
            }   
        }

        var objectToInsert = {ip : ipDoMote},
        dataArray = [];

        for(var i = 0; i < values.length; i++){
            var lineVals = values[i].split('/'),
            obj = {
                folder: lineVals[1],
                resource : lineVals[2]
            };
            dataArray.push(obj);
        }
        objectToInsert.data = dataArray;
        return objectToInsert;
    }
