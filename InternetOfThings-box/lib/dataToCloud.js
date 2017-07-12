var http = require('http'),
lxqry = require("./linuxquery.js");
var request = require('request');

module.exports = {
    sendDataToCloud : function(dataFusionObj){

        request({
            url: "http://" + lxqry.getHost() + ":4000/insert",
            json: true,
            method: 'POST',
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(dataFusionObj)
        }, function(error, response, body) {
            console.log(error, response, body);
        });


        /*
        var jsonObject = JSON.stringify(dataFusionObj);

        var postheaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(jsonObject)
        };

        var options = {
            host: lxqry.getHost(),
            port: 4000,
            path: '/insert',
            method: 'POST',
            headers : postheaders
        };

        try {

            var reqPost = http.request(options, function(res) {
              console.log('STATUS: ' + res.statusCode);

              res.setEncoding('utf8');
              res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
            });
          });
            reqPost.write(jsonObject);
            reqPost.end();
            reqPost.on('error', function(e) {
                console.error(e);
            });
        } catch (e){
            console.log("Erro ao tentar ligar ao servidor remoto!!!")
        }*/
    },

    getDataCloud : function(){
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
              res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
            });
          });
            reqGet.end();
            reqGet.on('error', function(e) {
                console.error(e);
            });
        } catch (e){
            console.log("Erro ao tentar ligar ao servidor remoto!!!")
        }
    }
}