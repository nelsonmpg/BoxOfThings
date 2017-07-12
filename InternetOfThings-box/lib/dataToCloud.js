var http = require('http'),
lxqry = require("./linuxquery.js");


module.exports = {
    sendDataToCloud : function(dataFusionObj){

        var data = querystring.stringify(dataFusionObj);
        // var jsonObject = JSON.stringify(dataFusionObj);

        var options = {
            host: lxqry.getHost(),
            port: 4000,
            path: '/insert',
            method: 'POST',
            headers : {
                'Content-Type' : 'application/json',
                'Content-Length' : Buffer.byteLength(data, 'utf8')
            }
        };

        try {

            var reqPost = http.request(options, function(res) {
              console.log('STATUS: ' + res.statusCode);

              res.setEncoding('utf8');
              res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
            });
          });
            reqPost.write(data);
            reqPost.end();
            reqPost.on('error', function(e) {
                console.error(e);
            });
        } catch (e){
            console.log("Erro ao tentar ligar ao servidor remoto!!!")
        }
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