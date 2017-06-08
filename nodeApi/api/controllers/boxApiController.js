'use strict';

var mongoose = require('mongoose'),
  Info = mongoose.model('MoteInfo'),
  coap = require('coap'),
  URL = require('url'),
  CryptoJS = require("crypto-js")

exports.get_all_info = function(req, res) {
  Info.find({}, function(err, info) {
    if (err)
      res.send(err);
    res.json(info);
  });
};

exports.single_mote_all_info = function(req, res) {
  //req.params.moteIp
  //req.params.resource - getAllSensorsValues
    // getdataFromSensor(endereco,folder,resource,params,payload,mMethod,mObserve,mKey,response)
    //getdataFromSensor('[fd00::212:4b00:60d:b2af]','sensors','button','',undefined,'GET',true,key);
    getdataFromSensor(req.params.moteIp,'data',req.params.resource,'',undefined,'GET',true,key,res);
};

exports.single_mote_single_info = function(req, res) {
  //req.params.moteIp
  //req.params.resource
    // getdataFromSensor(endereco,folder,resource,params,payload,mMethod,mObserve,mKey,response)
    //getdataFromSensor('[fd00::212:4b00:60d:b2af]','sensors','button','',undefined,'GET',true,key);
    getdataFromSensor(req.params.moteIp,'data',req.params.resource,'',undefined,'GET',true,key,res);
};

//Tem de se ver como receber o payload, se fazem eles e enviam num campo do json do request ou como é...
//Tem de existir pelo menos algo que identifique o tipo de payload e depois saber ao certo o que é suposto ir para lá e cenas...
exports.mote_action = function(req, res) {
  //req.params.moteIp
  //req.params.resource
    // getdataFromSensor(endereco,folder,resource,params,payload,mMethod,mObserve,mKey,response)
    //getdataFromSensor('[fd00::212:4b00:60d:b2af]','sensors','button','',undefined,'GET',true,key);
    getdataFromSensor(req.params.moteIp,'actuators',req.params.resource,'',undefined,'POST',true,key,res);
};



function getdataFromSensor(endereco,folder,resource,params,payload,mMethod,mObserve,mKey,response) {
  var req,
    request = coap.request,
    url,
    delayMillis = 3000,
    method = 'GET',
    requestString = 'coap://' + endereco + ':5683/' + folder + '/' + resource + params;
    mKey = CryptoJS.enc.Hex.parse('000102030405060708090A0B0C0D0EFF');

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

       res.on('data', function(msg) {
          console.log('Data:',msg);
          var data = CryptoJS.enc.Hex.parse(res.payload.toString("hex"));

          var encrypted = {};
          encrypted.key = mKey;
          encrypted.ciphertext = data;

          var decrypted3 = CryptoJS.AES.decrypt(encrypted, mKey, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.NoPadding
          });
          try{
            	//console.log(CryptoJS.enc.Utf8.stringify(decrypted3));
            	console.log(CryptoJS.enc.Hex.stringify(decrypted3));
				      console.log(CryptoJS.enc.Utf8.stringify(decrypted3));
              response.json(CryptoJS.enc.Utf8.stringify(decrypted3));
          } catch (err){
            response.send(err);
          }
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



/*

exports.create_a_task = function(req, res) {
  var new_task = new Task(req.body);
  new_task.save(function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};



exports.update_a_task = function(req, res) {
  Task.findOneAndUpdate(req.params.taskId, req.body, {new: true}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};


exports.delete_a_task = function(req, res) {


  Task.remove({
    _id: req.params.taskId
  }, function(err, task) {
    if (err)
      res.send(err);
    res.json({ message: 'Task successfully deleted' });
  });
};
*/
