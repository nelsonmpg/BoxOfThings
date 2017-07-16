require('colors');
var coap = require('coap'),
    http = require('http'),
    URL = require('url'),
    http = require('http'),
    CryptoJS = require("crypto-js"),
    BN = require('bn.js'),
    EC = require('elliptic').ec,
    ec = new EC('p192'),
    Sensor = require('./models/sensor.js'),
    Route = require('./models/route.js'),
    // key = CryptoJS.enc.Hex.parse('B007AFD752937AFF5A4192268A803BB7'),
    replaceRegex = /\u0000/gi,
    utils = require('./utils.js'),
    util = require('util')
motesKeys = [];

Sensor = new Sensor();
Route = new Route();

module.exports = {
    serverListening: function(sock) {
        var self = this;
        console.log('CONNECTED: %s:%s'.cyan.underline, sock.remoteAddress, sock.remotePort);

        sock.on('data', function(data) {
            // console.log('DATA ' + sock.remoteAddress + ': ' + data);
            try {
                var req = JSON.parse(data);
                module.exports[req.request](req, sock);

            } catch (e) {
                console.log("Invalid args - " + e, data.toString('utf8'));
            }
        });
        sock.on('close', function(data) {
            console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
        });
    },

    updateCheckSensor: function(req, res) {
        var objsend = {
            moteip: req.params.moteIp,
            ck: (req.params.ck.toString().trim().toLowerCase() == "sim" || req.params.ck.toString().trim().toLowerCase() == "yes" ? true : false),
            pubX: req.params.pubX,
            pubY: req.params.pubY,
            secret: GeraChaveSimetrica(req.params.pubX, req.params.pubY)
        }
        Sensor.updateCheckedAndKeysSensor(objsend, res);
    },

    getValuesFromSensors: function() {
        Sensor.getSensorsAndKey(module.exports.getValuesFromSensorsCallback);
    },

    getValuesFromSensorsCallback: function(err, result) {
        for (var i in result) {
            motesKeys[result[i].ip] = result[i].secret;
        }
        // console.log(motesKeys);
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
        getdataFromSensorReq(endereco, folder, resource, params, payload, mMethod, mObserve, motesKeys[req.params.moteIp], res);
    },

    single_mote_all_info: function(req, res) {
        console.log(req.params.moteIp);
        getdataFromSensorReq(req.params.moteIp, 'data', "AllValues", '', undefined, 'GET', true, motesKeys[req.params.moteIp], res);
    },

    single_mote_single_info: function(req, res) {
        console.log(req.params.moteIp, req.params.resource);
        getdataFromSensorReq(req.params.moteIp, 'data', req.params.resource, '', undefined, 'GET', true, motesKeys[req.params.moteIp], res);
    },

    mote_action: function(req, res) {
        console.log(req.params.moteIp, req.params.resource, req.params.color, req.params.mode);
        getdataFromSensorReq(req.params.moteIp, 'actuators', req.params.resource, '?leds=' + req.params.color, 'mode=' + req.params.mode, 'POST', false, motesKeys[req.params.moteIp], res);
    }
};


var getdataFromSensorReq = function(endereco, folder, resource, params, payload, mMethod, mObserve, key, response) {

    var req,
        request = coap.request,
        url,
        delayMillis = 3000,
        method = 'GET',
        // requestString = 'coap://[aaaa::212:4b00:60d:b305]:5683/test/hello';
        // requestString = 'coap://[aaaa::212:4b00:60d:60fe]:5683/.well-known/core';
        requestString = 'coap://' + endereco + ':5683/' + folder + '/' + resource + params,
        mKey = CryptoJS.enc.Hex.parse(key); 

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

            if (response) {
                if (response instanceof http.ServerResponse) {
                    response.json(CryptoJS.enc.Utf8.stringify(decrypted3).replace(replaceRegex, ''));
                } else if (typeof response === "object") {
                    response.write(CryptoJS.enc.Utf8.stringify(decrypted3).replace(replaceRegex, ''));
                } else {
                    response(CryptoJS.enc.Utf8.stringify(decrypted3));
                }
            }
        } catch (err) {
            if (response) {
                if (response instanceof http.ServerResponse) {
                    response.send(err);
                } else if (typeof response === "object") {
                    response.write(JSON.stringify(err));
                } else {
                    response(JSON.stringify(err));
                }
            }
        }
        res.on('data', function(msg) {
            if (!response) {
                // console.log('Data:', msg);
                // console.log('Data456:',CryptoJS.enc.Utf8.stringify(msg));
                var methodsReceive = getMoteMethods(endereco, msg);
                // console.log(util.inspect(methodsReceive, false, null, true));
                Sensor.insertSensorMethods(methodsReceive.ip, methodsReceive.data);
            }
        })


        // print only status code on empty response
        try {
            if (!res.payload.length) {
                process.stderr.write('\x1b[1m(' + res.code + ')\x1b[0m\n');
                console.log(res.payload);
                console.log("Teste - " + res.payload);
                if (response) {
                    if (response instanceof http.ServerResponse) {
                        response.json(res.payload);
                    } else if (typeof response === "object") {
                        response.write(JSON.stringify(res.payload));
                    } else {
                        response(JSON.stringify(res.payload));
                    }
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
            var keymot = motesKeys[routes[i]];
            if (keymot && keymot !== undefined && keymot.trim().length > 0) {
                // console.log("Key ->", keymot);
                getdataFromSensorReq(routes[i], ".well-known", "core", "", "", "GET", false, keymot, null);
                getdataFromSensorReq(routes[i], "data", "AllValues", "", "", "GET", false, keymot, function(data) {

                    try {
                        data = removeProbChars(data);
                        var obJson = JSON.parse(data).Sensors;

                        /****************** O INSERT FUNCIONA ******************/
                        var obj = {
                            ip: routes[i],
                            dataVals: {
                                readingDate: utils.dateTimeFormat(new Date()),
                                temperature: (Math.random() * 100).toFixed(2), //(obJson.Temperature.toString() == "00.-1") ? "-1" : obJson.Temperature,
                                humidity: (Math.random() * 100).toFixed(2), //(obJson.Humidity.toString() == "00.-1") ? "-1" : obJson.Humidity,
                                loudness: (Math.random() * 100).toFixed(2), //(obJson.Loudness.toString() == "00.-1") ? "-1" : obJson.Loudness,
                                light: (Math.random() * 100).toFixed(2) //(obJson.Light.toString() == "00.-1") ? "-1" : obJson.Light
                            }
                        }

                        // console.log("\nSimular insert:\n", obj);
                        Sensor.insertOrUpdate(obj);
                        /********************************************************/

                    } catch (e) {
                        console.error("ERRor", e);
                    }
                });
            } else {

                try {
                    /****************** O INSERT default ******************/
                    var obj = {
                        ip: routes[i],
                        dataVals: {
                            readingDate: utils.dateTimeFormat(new Date())//,
                            // temperature: "0",
                            // humidity: "0",
                            // loudness: "0",
                            // light: "0"
                        }
                    }
                    // console.log("\nSimular insert:\n", obj);
                    Sensor.insertOrUpdate(obj);
                    /********************************************************/

                } catch (e) {
                    console.error(e);
                }
            }
            //try fim do for
        } catch (e) {
            console.error(e);
        }
        // *************************** New Call Get all Metodos *******************
    }
}

var getMoteMethods = function(ipDoMote, data) {
    //Trocar isto pela chamada da função getdatalalalalas
    //ou seja, chamar a função e enviar para aqui por param (data) os dados desencriptados
    // var data = '</.well-known/core>;ct=40,</test/ola>;title="Olá Mundo1: ?len=0..";rt="Text",</test/hello>;title="Hello world: ?len=0..";rt="Text",</actuators/leds>;title="LEDs: ?color=r|g|b, POST/PUT mode=on|off";rt="Control",</actuators/toggle>;title="Red LED";rt="Control",</sensors/button>;title="Event demo";obs,</test/separate>;title="Separate demo",</test/push>;title="Periodic demo";obs,</test/sub>;title="Sub-resource demo",</sensors/sht25>;title="Temperature and Humidity";rt="SHT25",</sensors/zoul>;title="Zoul on-board sensors";rt="zoul"',
    //Para chamar a função usar isto:
    //GET
    //FOLDER: .well-known
    //RESOURCE: core

    resSplit = data.split(','),
        values = [];
    for (var i = 0; i < resSplit.length; i++) {
        if (resSplit[i].startsWith("<")) {
            var lastIndex = resSplit[i].lastIndexOf('>');
            values.push(resSplit[i].substr(1, lastIndex));
        }
    }

    var objectToInsert = { ip: ipDoMote },
        dataArray = [];

    for (var i = 0; i < values.length; i++) {
        var lineVals = values[i].split('/');
        if (lineVals.length > 1) {
            var obj = {
                folder: lineVals[1],
                resource: lineVals[2].replace(/>/g, "")
            };
            dataArray.push(obj);
        }
    }
    objectToInsert.data = dataArray;
    return objectToInsert;
}

var GeraChaveSimetrica = function(xB, yB) {

    //Define os pontos publicos BOX
    var OwnX = '11FA2B68851DEDA9B0CE4D6EFD76F4623DD4600FEB5824EF';
    var OwnY = '1B2585D62B7E6055C8534362A55F7F4F6EAB50F376CF18CE';
    //Gera chave 
    var OwnPubKey = {
        x: OwnX.toString('hex'),
        y: OwnY.toString('hex')
    };
    //Faz o par de chaves
    var OwnKeyPair = ec.keyFromPublic(OwnPubKey, 'hex');
    //define chave privada
    OwnKeyPair.priv = new BN('A722747CCF51EB381BA75A75A74DF4EB31633C852E0D97EE', 16);

    // console.log("Mote x:" + xB.toString('hex'));
    // console.log("Mote y:" + yB.toString('hex'));

    var pubB = {
        x: xB.toString('hex'),
        y: yB.toString('hex')
    };

    var key2 = ec.keyFromPublic(pubB, 'hex');

    //console.log(OwnKeyPair);
    // console.log(key2.getPublic());
    //gera chave partilhada
    var shared1 = OwnKeyPair.derive(key2.getPublic());
    // console.log("Partilhada " + shared1.toString(16));

    //PARA POR CHAVE NO MESMO FORMATO DO QUE ESTA NOS MOTES
    var res = shared1.toString(16).match(/.{2}/g);
    var final = ""
    res.reverse().forEach(function(entry, idx, array) {
        if (idx < 16) {
            final += entry;
        }
    });

    // console.log(final);
    // FIM - GERAR CHAVE SIMETRICA
    // return final;
    result 'B007AFD752937AFF5A4192268A803BB7';

}