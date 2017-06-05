var coap = require('coap'),
request = coap.request,
URL = require('url'),
method = 'GET',
url,
req,
delayMillis = 3000,
CryptoJS = require("crypto-js"),
key = CryptoJS.enc.Hex.parse('000102030405060708090A0B0C0D0EFF');

//getdataFromSensor('[aaaa::212:4b00:60d:b2af]','test','hello','','');
//getdataFromSensor('[aaaa::212:4b00:60d:b2af]','actuators','leds','?color=r','mode=on');

//getdataFromSensor('[fd00::212:4b00:60d:b2af]','test','hello','',undefined,'GET',false,key);

 //var req = coap.request('coap://[aaaa::c30c:0:0:2]:5683/test/hello')
//getdataFromSensor('[fd00::212:4b00:60d:b2af]','sensors','button','',undefined,'POST',true,key);

getdataFromSensor('[fd00::212:4b00:60d:b2af]','sensors','button','',undefined,'GET',true,key);

//getdataFromSensor('[fd00::212:4b00:60d:b2af]','actuators','leds?color=r','','mode=on','post',false);

function getdataFromSensor(endereco,folder,resource,params,payload,mMethod,mObserve,mKey) {

 var requestString = 'coap://' + endereco + ':5683/' + folder + '/' + resource + params;
      console.log(requestString);

      url = URL.parse(requestString);
      url.method = mMethod;
      url.observe = mObserve;
      url.confirmable = false;


      coap.parameters.exchangeLifetime = 30;

      req = request(url);
      if(!mObserve){
      	req.setOption('Block2', new Buffer([0x06]));
      }
      
      req.on('response', function (res) {
        res.setEncoding('utf8');
        console.log('chegou uma resposta');
        
         res.on('data', function(msg) {
            console.log('Data:',msg);
            var data = CryptoJS.enc.Hex.parse(res.payload.toString("hex"));

            var encrypted = {};
            encrypted.key = mKey;
            //encrypted.iv=iv;
            encrypted.ciphertext = data;

            var decrypted3 = CryptoJS.AES.decrypt(encrypted, mKey, {
              mode: CryptoJS.mode.ECB,
              padding: CryptoJS.pad.NoPadding
            });
            try{
              	//console.log(CryptoJS.enc.Utf8.stringify(decrypted3));
              	console.log(CryptoJS.enc.Hex.stringify(decrypted3));
  				console.log(CryptoJS.enc.Utf8.stringify(decrypted3));
            } catch (err){
              console.log(err);
            }
            console.log('passou aqui:')

          })
        // print only status code on empty response
        if (!res.payload.length) {
          process.stderr.write('\x1b[1m(' + res.code + ')\x1b[0m\n');
          console.log(res.payload);
        }
      })

      if (method === 'GET' || method === 'DELETE' || payload) {
        req.end(payload);
      } else {
        process.stdin.pipe(req);
      }
}
