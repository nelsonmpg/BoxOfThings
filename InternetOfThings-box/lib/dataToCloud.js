var http = require('http'),
lxqry = require("./linuxquery.js"),
querystring = require('querystring');

module.exports = {
    sendDataToCloudDataFusion: function(dataFusionObj) {
        var jsonObject = JSON.stringify(dataFusionObj);

        var postheaders = {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject)
        };

        var options = {
            host: lxqry.getRemoteHostVals("host"),
            port: lxqry.getRemoteHostVals("port"),
            path: '/insert',
            method: 'POST',
            headers: postheaders
        };

        try {
            var req = http.request(options, function(res) {
                console.log('STATUS: ' + res.statusCode);
                res.setEncoding('utf8');
                var responseString = '';
                res.on('data', function(data) {
                    responseString += data;
                });
                res.on('end', function() {
                    console.log(responseString);
                });
            });
            req.write(jsonObject);
            req.end();
            req.on('error', function(e) {
                console.error(e);
            });
        } catch (e) {
            console.log("Erro ao tentar ligar ao servidor remoto!!!")
        }
    },

    sendDataToCloudParcial : function(fullDataFusionObj){
        for (var i in fullDataFusionObj.readings) {
            var parcialObj = {
                objecttype: 'SensorIOT', 
                boxname: fullDataFusionObj.boxname, 
                boxmac: fullDataFusionObj.boxmac, 
                sensorid: fullDataFusionObj.moteip, 
                sensorname: fullDataFusionObj.readings[i].sensorType, 
                sensortype: "Sensor-" + (i + 1), 
                sensorvalue: fullDataFusionObj.readings[i].Average
            }
            module.exports.sendDataToCloudDataFusion(parcialObj);
        }
   },

   getDataCloud: function() {
    var options = {
        host: lxqry.getHost(),
        port: 4000,
        path: '/Teste',
        method: 'GET'
    };

    try {

        var reqGet = http.request(options, function(res) {
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
