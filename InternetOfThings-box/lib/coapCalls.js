require('colors');
var coap = require('coap'),
    URL = require('url'),
    http = require('http'),
    CryptoJS = require("crypto-js"),
    Sensor = require('./models/sensor.js'),
    Addr = require('./models/addr.js'),
    log = require('./serverlog.js'),
    key = CryptoJS.enc.Hex.parse('B007AFD752937AFF5A4192268A803BB7');

Sensor = new Sensor();
Addr = new Addr();

module.exports = {
    serverListening: function(sock) {
        var self = this;
        console.log('CONNECTED: %s:%s'.italic.rainbow, sock.remoteAddress, sock.remotePort);
        log.appendToLog('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

        sock.on('data', function(data) {
            // console.log('DATA ' + sock.remoteAddress + ': ' + data);
            log.appendToLog('DATA ' + sock.remoteAddress + ': ' + data);
            var req = JSON.parse(data);
            console.log(req);

            module.exports[req.request](req, sock);
        });
        sock.on('close', function(data) {
            log.appendToLog('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
            console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
        });
    },
    getValuesFromSensors: function(){
	Addr.getAllData(callMoteFunctions);
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
        getdataFromSensorReq(endereco, folder, resource, params, payload, mMethod, mObserve, key, res);
    },

    single_mote_all_info: function(req, res) {
        getdataFromSensorReq(req.params.moteIp, 'data', req.params.resource, '', undefined, 'GET', true, key, res);
    },

    single_mote_single_info: function(req, res) {
        getdataFromSensorReq(req.params.moteIp, 'data', req.params.resource, '', undefined, 'GET', true, key, res);
    },

    mote_action: function(req, res) {
        getdataFromSensorReq(req.params.moteIp, 'actuators', req.params.resource, '', undefined, 'POST', true, key, res);
    }
};


var getdataFromSensorReq = function(endereco, folder, resource, params, payload, mMethod, mObserve, key, response) {

    var req,
        request = coap.request,
        url,
        delayMillis = 3000,
        method = 'GET',
        requestString = 'coap://' + endereco + ':5683/' + folder + '/' + resource + params;
    mKey = key;

    console.log(requestString);
    log.appendToLog(requestString);

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

//        res.on('data', function(msg) {

                //console.log('Data:', msg);
                //log.appendToLog('Data:', msg);

                var data = CryptoJS.enc.Hex.parse(res.payload.toString("hex"));

                var encrypted = {};
                encrypted.key = mKey;
                encrypted.ciphertext = data;

                var decrypted3 = CryptoJS.AES.decrypt(encrypted, mKey, {
                    mode: CryptoJS.mode.ECB,
                    padding: CryptoJS.pad.NoPadding
                });


                try {

		    //console.log("\nDecrypted:\n ",CryptoJS.enc.Utf8.stringify(decrypted3));
		    //log.appendToLog(CryptoJS.enc.Utf8.stringify(decrypted3));

		    response(CryptoJS.enc.Utf8.stringify(decrypted3));

		    /*
                    if (response instanceof http.ServerResponse) {
                        response.json(CryptoJS.enc.Utf8.stringify(decrypted3));
                    }  
		    else {
                        response.write(JSON.stringify(CryptoJS.enc.Utf8.stringify(decrypted3)));
                    } 
		    */
                } catch (err) {
		    /*
                    if (response instanceof http.ServerResponse) {
                        response.send(err);
                    } else {
                        response.write(JSON.stringify(err));
                    }*/	
                }
           // })
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

function removeProbChars(data){
	var normalString ="";
	for(var x=0; x<data.length; ++x){
		let c = data.charCodeAt(x);
		if(c >= 0 && c <= 31){
		    //console.log( 'problematic character found at position ' + x);
		    normalString = data.substring(0,x);
		    break;
		}else {
			//console.log(data[x]);		
		}
	}
	return normalString;
}

function callMoteFunctions(addrs){

	for(var i in addrs){
		try{
			getdataFromSensorReq(addrs[i].address, "data", "AllValues", "", "", "get", false, key, function(data) {	
		
			try {
				console.log(data);
				data = removeProbChars(data);
				var obJson = JSON.parse(data).Sensors;

				/****************** O INSERT FUNCIONA ******************/	
				var obj = {
					ip: addrs[i].address,
					temperature: (obJson.Temperature.toString() == "00.-1") ? "-1" : obJson.Temperature,
					humidity: (obJson.Humidity.toString() == "00.-1") ? "-1" : obJson.Humidity,
					loudness: (obJson.Loudness.toString() == "00.-1") ? "-1" : obJson.Loudness,
					light: (obJson.Light.toString() == "00.-1") ? "-1" : obJson.Light
				};
		
				//console.log("\nSimular insert:\n",obj);
				Sensor.insertData(obj);	 
				/********************************************************/
	
			} catch (e) {
			    console.error(e);
			    
			}
	   	 });
		//try fim do for
		}catch(e){ console.error(e);}
	}
}
