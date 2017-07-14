var https = require('https'),
    linuxquery = require("./linuxquery.js"),
    httpspost = require('https-post');;

module.exports = {
    sendDataToCloudDataFusion: function(dataFusionObj, path) {
        // var jsonObject = JSON.stringify(dataFusionObj);

        // var options = {
        //     host: linuxquery.getRemoteHostVals("host"),
        //     port: linuxquery.getRemoteHostVals("port"),
        //     path: '/' + path,
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Content-Length': jsonObject.length /*Buffer.byteLength(jsonObject)*/
        //     }
        // };
        // console.log(options);

        httpspost('https://' + linuxquery.getRemoteHostVals("host") + ':' + linuxquery.getRemoteHostVals("port") + '/' + path, dataFusionObj, function(res) {
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                console.log(chunk);
            });
        });




        // try {
        //     var req = https.request(options, function(res) {
        //         console.log('STATUS: ' + res.statusCode);
        //         res.setEncoding('utf8');
        //         var responseString = '';
        //         res.on('data', function(data) {
        //             responseString += data;
        //         });
        //         res.on('end', function() {
        //             console.log("response - ",responseString);
        //         });
        //     });
        //     req.write(jsonObject);
        //     req.end();
        //     req.on('error', function(e) {
        //         console.error("error -> ", e);
        //     });
        // } catch (e) {
        //     console.log("Erro ao tentar ligar ao servidor remoto!!!", e)
        // }
    },

    sendDataToCloudParcial: function(fullDataFusionObj) {
        for (var i in fullDataFusionObj.readings) {
            var parcialObj = {
                objecttype: 'SensorIOT',
                boxname: fullDataFusionObj.boxname,
                boxmac: fullDataFusionObj.boxmac,
                sensorid: fullDataFusionObj.moteip,
                sensorname: fullDataFusionObj.readings[i].sensorType,
                sensortype: "Sensor-" + (i * 1 + 1),
                sensorvalue: fullDataFusionObj.readings[i].values.Average
            }
            module.exports.sendDataToCloudDataFusion(parcialObj, 'sensors');
        }
    },

    sendToCheckSensoresValidate: function(motesip) {
        for (var i in motesip) {
            console.log("Mote for -> ", motesip[i]);
            var parcialObj = {
                objecttype: 'SensorIOT',
                boxname: linuxquery.getRemoteHostVals("boxname"),
                boxmac: linuxquery.getRemoteHostVals("boxmac"),
                sensorid: motesip[i].ip
            }
            module.exports.sendDataToCloudDataFusion(parcialObj, 'sensorscheck');
        }
    },

    sendDataBoxTypes: function() {
        var boxValues = lxqry.getRemoteHostVals("boxData");

        if (boxValues != undefined) {
            boxValues.objecttype = 'BoxIOT';
            module.exports.sendDataToCloudDataFusion(boxValues, 'boxes');
        }
    },

    getDataCloud: function() {
        var options = {
            host: linuxquery.getHost(),
            port: 4000,
            path: '/Teste',
            method: 'GET'
        };

        try {

            var reqGet = https.request(options, function(res) {
                console.log('STATUS: ' + res.statusCode);
                console.log('HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', function(chunk) {
                    console.log('BODY: ' + chunk);
                });
            });
            reqGet.end();
            reqGet.on('error', function(e) {
                console.error(e);
            });
        } catch (e) {
            console.log("Erro ao tentar ligar ao servidor remoto!!!")
        }
    }
}
