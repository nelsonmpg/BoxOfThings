
require('prototypes');
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
var fs = require('fs');
var pedido = new Buffer("1234567890");
var dados = new Buffer("123456");
var sleep = require('sleep');

var sensores = [];


// Em teoria era só pôr esta a função a correr de tempo a tempo para pedir os valores aos sensores
// function pedeDados(){
//     for (i=0; i<sensores.length; i++){
//       server.send(dados, 0, dados.length, 10001, sensores[i]);
//       console.log("Envio da mensagem : " + dados + " para " + sensores[i] + ":10001" );
//     }
// }

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});


//Se houver alguma mensagem no socket então vem para este evento --> 'message'
server.on('message', (msg, rinfo) => {
	var mensagem = `${msg}`;
  var acedeu = false;

	console.log('Mensagem recebida: ', `${msg}`);

  //Se a mensagem conter 'gotit' então envia-se uma mensagem de 6 bits para pedir à placa os seus valores
  if (mensagem.includes("gotit")){
      server.send(dados, 0, dados.length, 10001, rinfo.address);
      console.log("Envio da mensagem : " + dados + " para " + rinfo.address + ":" + rinfo.port);
  }


  //Se a mensagem conter 'yolo' então é porque é a mensagem que contém os valores dos sensores. Aqui guada-se os valores num txt chamado de 'log.txt'
  if ( mensagem.includes("yolo")){
    //retira o 'yolo#' da mensagem, tornando-se um array de duas posições. A primeira vai estar vazia e a segunda contém os dados
    var res = mensagem.split("yolo#");

    var time =  new Date();

    //Concatena a data com os dados dos sensores
    var str = time.getDate() + '-' + time.getMonth() + '-' + time.getFullYear() + ' ' + time.getHours() + ':' + time.getMinutes() +'#' + res[1];

    //Guarda a string 'str' no ficheiro 'log.txt'
    fs.appendFile("log.txt", str + "\r\n", function(error) {
        if(error) throw error; // Handle the error just in case
        else console.log("Success!");
    });
  }

  //Se a mensagem conter 'Vita' então guarda o IP da placa num array e envia um mensagem à placa a dizer que já recebiu o seu broadcast.
  if ( mensagem.includes("Vita")){
    console.log(`Sensor Autenticado com a mensagem: ${msg} de ${rinfo.address}:${rinfo.port}`);


    if (!sensores.length){
      sensores.push(rinfo.address);
    }

    for (var i = 0; i < sensores.length; i++){

      if (sensores[i] == rinfo.address){
        acedeu = true;
      }

      if (sensores[i] !== rinfo.address && i == sensores.length-1 && acedeu == false){
        sensores.push(rinfo.address);
      }

      if (i == sensores.length-1 && acedeu == true){
        acedeu = false;
      }
    }

    console.log('Array de sensores:', sensores);
    server.send(pedido, 0, pedido.length, rinfo.port, rinfo.address);
    console.log("Envio da mensagem : " + pedido + " para " + rinfo.address + ":" + rinfo.port);

  } //fim do if do Vita

});  //fim do server.on 'message'

server.on('listening', () => {
  const address = server.address();
  console.log(`Servidor á escuta no ip ${address.address}:${address.port}`);
});

server.bind({
  port: 10001,
  exclusive: true
});
