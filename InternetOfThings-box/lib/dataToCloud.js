var http = require('http'),
    lxqry = require("./linuxquery.js"),
    querystring = require('querystring');

module.exports = {
    sendDataToCloud: function(dataFusionObj) {

        var jsonObject = querystring.stringify(dataFusionObj);

        var postheaders = {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(jsonObject)
        };

        var options = {
            host: lxqry.getHost(),
            port: 4000,
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
            req.write(dataFusionObj);
            req.end();
            req.on('error', function(e) {
                console.error(e);
            });
        } catch (e) {
            console.log("Erro ao tentar ligar ao servidor remoto!!!")
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
