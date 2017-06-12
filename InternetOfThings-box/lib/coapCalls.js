require('colors');
var coap = require('coap'),
    URL = require('url'),
    CryptoJS = require("crypto-js"),
    Sensor = require('./models/sensor.js'),
    log = require('./serverlog.js');

Sensor = new Sensor();

module.exports = {
    serverListening: function(sock) {
        var self = this;
        console.log('CONNECTED: %s:%s'.italic.rainbow, sock.remoteAddress, sock.remotePort);
        log.appendToLog('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

        sock.on('data', function(data) {
            console.log('DATA ' + sock.remoteAddress + ': ' + data);
            log.appendToLog('DATA ' + sock.remoteAddress + ': ' + data);
            var req = JSON.parse(data);
            console.log(req);

            module.exports.singleMoteAllInfo(req, sock);

            // getdataFromSensorReq(req.params.moteIp, 'data', req.params.resource, '', undefined, 'GET', true, undefined, sock);

        });
        sock.on('close', function(data) {
            log.appendToLog('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
            console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
        });
    },

    getdataFromSensor: function(req, res) {
        var endereco = req.params.endereco === "undefined" ? "" : req.params.endereco,
            folder = req.params.folder === "undefined" ? "" : req.params.folder,
            resource = req.params.resource === "undefined" ? "" : req.params.resource,
            params = req.params.params === "undefined" ? "" : req.params.params,
            payload = req.params.payload === "undefined" ? "" : req.params.payload,
            mMethod = req.params.mMethod === "undefined" ? "GET" : req.params.mMethod,
            mObserve = req.params.mObserve === "undefined" ? "" : req.params.mObserve;

        resource = resource.replace("§", "?");
        getdataFromSensorReq(endereco, folder, resource, params, payload, mMethod, mObserve, mKey, res);
    },

    singleMoteAllInfo: function( req, res) {
        console.log(req);
        getdataFromSensorReq(req.params.moteIp, 'data', req.params.resource, '', undefined, 'GET', true, key, res);
    },

    single_mote_single_info: function(req, res) {
        getdataFromSensorReq(req.params.moteIp, 'data', req.params.resource, '', undefined, 'GET', true, key, res);
    },

    mote_action: function(req, res) {
        getdataFromSensorReq(req.params.moteIp, 'actuators', req.params.resource, '', undefined, 'POST', true, key, res);
    }

};


var getdataFromSensorReq = function(endereco, folder, resource, params, payload, mMethod, mObserve, mKey, response) {

    console.log(endereco, folder, resource, params, payload, mMethod, mObserve, mKey, "response");
    response.write(JSON.stringify({ response: "testeOK" }));
    return;
    var req,
        request = coap.request,
        url,
        delayMillis = 3000,
        method = 'GET',
        requestString = 'coap://' + endereco + ':5683/' + folder + '/' + resource + params;
    mKey = CryptoJS.enc.Hex.parse('000102030405060708090A0B0C0D0EFF');

    console.log(requestString);
    log.appendToLog(requestString);

    url = URL.parse(requestString);
    url.method = mMethod;
    url.observe = mObserve;
    url.confirmable = false;


    coap.parameters.exchangeLifetime = 30;

    req = request(url);
    if (!mObserve) {
        req.setOption('Block2', new Buffer([0x06]));
    }

    req.on('response', function(res) {
        res.setEncoding('utf8');

        res.on('data', function(msg) {
                console.log('Data:', msg);
                log.appendToLog('Data:', msg);

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
                    console.log(CryptoJS.enc.Hex.stringify(decrypted3));
                    console.log(CryptoJS.enc.Utf8.stringify(decrypted3));

                    log.appendToLog(CryptoJS.enc.Hex.stringify(decrypted3));
                    log.appendToLog(CryptoJS.enc.Utf8.stringify(decrypted3));

                    if (response instanceof http.ServerResponse) {
                        response.json(CryptoJS.enc.Utf8.stringify(decrypted3));
                    } else {
                        response.write(JSON.stringify(CryptoJS.enc.Utf8.stringify(decrypted3)));
                    }
                } catch (err) {
                    if (response instanceof http.ServerResponse) {
                        response.send(err);
                    } else {
                        response.write(JSON.stringify(err));
                    }
                }
            })
            // print only status code on empty response
        if (!res.payload.length) {
            process.stderr.write('\x1b[1m(' + res.code + ')\x1b[0m\n');
            log.appendToLog(res.payload);
            console.log(res.payload);
            if (response instanceof http.ServerResponse) {
                response.json(res.payload);
            } else {
                response.write(JSON.stringify(res.payload));
            }
        }
    })

    if (method === 'GET' || method === 'DELETE' || payload) {
        req.end(payload);
    } else {
        process.stdin.pipe(req);
    }
}
