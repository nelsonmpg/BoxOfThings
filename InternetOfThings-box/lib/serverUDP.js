require('colors');
var dgram = require('dgram'),	
fs = require('fs'),
pedido = new Buffer("1234567890"),
dados = new Buffer("123456"),
Sensor = require('./models/sensor.js'),
utils = require('./utils.js');


var ServerUdp = function() {
	Sensor = new Sensor();
	this.server = dgram.createSocket('udp4');
	this.sensores = [];	
};

ServerUdp.prototype.start = function(){
	var self = this;

	self.server.on('error', function(err) {
		console.log('server error:', err.stack);
		self.server.close();
	});

	//Se houver alguma mensagem no socket então vem para este evento --> 'message'
	self.server.on('message', function(msg, rinfo) {
		var mensagem = msg;
		var acedeu = false;

		console.log('Mensagem recebida:', msg);

  		//Se a mensagem conter 'gotit' então envia-se uma mensagem de 6 bits para pedir à placa os seus valores
  		if (mensagem.includes("gotit")) {
  			self.server.send(dados, 0, dados.length, 10001, rinfo.address);
  			console.log("Envio da mensagem : " + dados + " para " + rinfo.address + ":" + rinfo.port);
  		}

  		//Se a mensagem conter 'yolo' então é porque é a mensagem que contém os valores dos sensores. Aqui guada-se os valores num txt chamado de 'log.txt'
  		if ( mensagem.includes("yolo")){
    		//retira o 'yolo#' da mensagem, tornando-se um array de duas posições. A primeira vai estar vazia e a segunda contém os dados
    		var res = mensagem.split("yolo#");

    		//Concatena a data com os dados dos sensores
    		var strValues = res[1].split("#");

    		//Guarda a string 'str' no ficheiro 'log.txt'
    		// yolo#25. 0#040.0#0010.0#00100
    		// temperatura, humidade, co e co2
    		var obj = {
    			ip: rinfo.address + ":" + rinfo.port,
    			dataVals: {
    				readingDate: utils.dateTimeFormat(Date.now()),
    				temperature: strValues[0] /*(Math.random() * 100).toFixed(2),*/,
    				humidity: strValues[1] /*(Math.random() * 100).toFixed(2),*/,
    				co: strValues[2] /*(Math.random() * 100).toFixed(2),*/,
    				co2: strValues[3] /*(Math.random() * 100).toFixed(2),*/
    			}
    		}

            // console.log("\nSimular insert:\n", obj);
            Sensor.insertOrUpdate(obj);
    		/*
    		fs.appendFile("log.txt", str + "\r\n", function(error) {
    			if(error){ 
        			throw error; // Handle the error just in case
        		}else{ 
        			console.log("Success!");
        		}
        	});*/    	
        }

  		//Se a mensagem conter 'Vita' então guarda o IP da placa num array e envia um mensagem à placa a dizer que já recebiu o seu broadcast.
  		if ( mensagem.includes("Vita")){
  			console.log('Sensor Autenticado com a mensagem: ' + msg + ' de ' + rinfo.address + ':' + rinfo.port);

  			if (!self.sensores.length){
  				self.sensores.push(rinfo.address);
  			}

  			for (var i = 0; i < self.sensores.length; i++){
  				if (self.sensores[i] == rinfo.address){
  					acedeu = true;
  				}
  				if (self.sensores[i] !== rinfo.address && i == self.sensores.length-1 && acedeu == false){
  					self.sensores.push(rinfo.address);
  				}
  				if (i == self.sensores.length-1 && acedeu == true){
  					acedeu = false;
  				}
  			}
  			console.log('Array de sensores:', self.sensores);
  			self.server.send(pedido, 0, pedido.length, rinfo.port, rinfo.address);
  			console.log("Envio da mensagem : " + pedido + " para " + rinfo.address + ":" + rinfo.port);
  		} //fim do if do Vita
	});  //fim do server.on 'message'

	self.server.on('listening', function() {
		var address = self.server.address();
		console.log('Server UDP listening   %s:%s'.green.bold, address.address,address.port);
	});

	self.server.bind({
		port: 10001,
		exclusive: true
	});
};

// Em teoria era só pôr esta a função a correr de tempo a tempo para pedir os valores aos sensores
ServerUdp.prototype.pedeDados = function (){
	var self = this;
	console.log("New Call RToS Sensors");
	for (i=0; i<self.sensores.length; i++){
		self.server.send(dados, 0, dados.length, 10001, self.sensores[i]);
		console.log("Envio da mensagem : " + dados + " para " + self.sensores[i] + ":10001" );
	}
};

module.exports = ServerUdp;