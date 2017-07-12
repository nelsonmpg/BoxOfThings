var http = require('http'),
lxqry = require("./linuxquery.js");


module.exports = {
    sendDataToCloud : function(dataFusionObj){
        var jsonObject = JSON.stringify(dataFusionObj);

        // prepare the header
        var postheaders = {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
        };

        var options = {
            host: lxqry.getHost(),
            port: 4000,
            path: '/insert',
            method: 'POST'
        };

        console.log(options);

        http.request(options, function(res) {
          console.log('STATUS: ' + res.statusCode);
          console.log('HEADERS: ' + JSON.stringify(res.headers));
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
      }).end();
    },

    getDataCloud : function(){
      //   var options = {
      //       host: "172.16.132.92",
      //       port: 4000,
      //       path: '/insert',
      //       method: 'GET'
      //   };

      //   http.request(options, function(res) {
      //     console.log('STATUS: ' + res.statusCode);
      //     console.log('HEADERS: ' + JSON.stringify(res.headers));
      //     res.setEncoding('utf8');
      //     res.on('data', function (chunk) {
      //       console.log('BODY: ' + chunk);
      //   });
      // }).end();
  }
}