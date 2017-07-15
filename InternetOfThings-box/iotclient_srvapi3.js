var http = require('http');
var express = require('express');
var app = express();
var fs = require('fs');
var cp = require('child_process').exec;
// var io = require('socket.io-client');
var request = require('request');
//var sys = require('sys');
var sys = require('util');
var HOST = 'cloud.cm-golega.pt';
var PORT = 3000;
var bodyParser = require('body-parser');

var serverUrl = 'http://cloud.cm-golega.pt:3000/boxes';
var ligacaossh = 0;
console.log(serverUrl);
//var exec = require('child_process').exec;
//var ligacaossh = cp('ssh -fN -R 7000:localhost:22  root@' + HOST + ' -p 22',{
//console.log("Ligacao SSH:" + ligacaossh);
//});

console.log("Open server on %j", HOST, ":", PORT);
// var conn = io.connect(serverUrl);

console.log('\n\n');
console.log('          888 d8b      d8b          888   ');
console.log('          888 Y8P      Y8P          888   ');
console.log('          888                       888   ');
console.log(' .d8888b  888 888      888  .d88b.  888888');
console.log('d88P"     888 888      888 d88""88b 888   ');
console.log('888       888 888      888 888  888 888   ');
console.log('Y88b.     888 888      888 Y88..88P Y88b. ');
console.log(' "Y8888P  888 888      888  "Y88P"   "Y888');
console.log('\n\n');
console.log("Open Box on %j", HOST, ":", PORT);

// Função de Envio de dados para o Servidor
// var exec = require('child_process').exec;
// var ligacaossh1 = exec("ssh -N -R 3000:localhost:22 root@cloud.cm-golega.pt", function(err, ligacaossh1, stderr) {
//     console.log("Nº de Ligações SSH: " + ligacaossh1);
// });

setInterval(function() {
    var macaddress
    // Valor da data e hora
    var datetime = new Date().toISOString().
    replace(/T/, ' '). // Susbtituir T por um espaco
    replace(/\..+/, '') // Apagar o ponto e o que estiver a seguir

    // Cria um novo array com todas as opções de digitos e letras da numeração hexadecimal
    var hexadecimal = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F");
    // Make variable to hold 6 character HEX array
    partA = new Array(1);
    partB = new Array(1);
    partC = new Array(1);
    partD = new Array(1);
    partE = new Array(1);
    partF = new Array(1);
    macaddress = "";
    for (i = 0; i < 2; i++) {
        partA[i] = hexadecimal[Math.round(Math.random() * 14)];
    }
    for (i = 0; i < 2; i++) {
        partB[i] = hexadecimal[Math.round(Math.random() * 14)];
    }
    for (i = 0; i < 2; i++) {
        partC[i] = hexadecimal[Math.round(Math.random() * 14)];
    }
    for (i = 0; i < 2; i++) {
        partD[i] = hexadecimal[Math.round(Math.random() * 14)];
    }
    for (i = 0; i < 2; i++) {
        partE[i] = hexadecimal[Math.round(Math.random() * 14)];
    }
    for (i = 0; i < 2; i++) {
        partF[i] = hexadecimal[Math.round(Math.random() * 14)];
    }
    macaddress = partA[0] + partA[1] + ":" + partB[0] + partB[1] + ":" + partC[0] + partC[1] + ":" + partD[0] + partD[1] + ":" + partE[0] + partE[1] + ":" + partF[0] + partF[1];
    // Fim de Criação de Mac-Address Aleatorio
    // Envio de mensagens para o Servidor
    // Set the headers


    var headers = {
        'User-Agent': 'Super Agent/0.0.1',
        'Content-Type': 'application/x-www-form-urlencoded'
    }


    var exec = require('child_process').exec;
    //var campos =  '{"id":"'+Math.round( Math.random() * (50 - 1) + 1)+'","employee_name":"Adam'+ Math.round( Math.random() * (10 - 1) + 1) +'","employee_salary":"'+ Math.round( Math.random() * (100 - 1) + 1) +'","employee_age":"'+ Math.round( Math.random() * (30 - 1) + 1) +'"}';
    // var cp = require('child_process');
    // var output = cp.spawnSync('sh', ['sc_conn_nl2.sh'], {
    //     encoding: 'utf8'
    // });
    //console.log(output.stdout.toString());

    //  'stdout': output.stdout.toString(),



    // var valor = parseInt(output.stdout.toString(), 0);
    // console.log('VALOR: ', valor);


    // if (valor == 0) {
    //     console.log('PARADO-----------------------: ');
    // } else {



        // Configure the request
        var tiposensor = new Array("Temperatura", "Humidade", "Luminosidade", "Som", "Gas", "Inundacao", "Energia", "Porta", "Janela");
        //var i = Math.floor(Math.random() * listasensor);

        partAs = new Array(1);
        for (i = 0; i < 1; i++) {
            partAs[i] = tiposensor[Math.round(Math.random() * 8)];
        }
        var sensortipo = partAs[0];

        var options = {
            url: 'http://cloud.cm-golega.pt:3000/sensors',
            method: 'POST',
            form: { 'boxname': 'BoxIoT', 'boxmac': macaddress, 'senmac': macaddress, 'sensorid': '1.0', 'sensorname': '1.0', 'sensortype': sensortipo, 'sensorvalue': Math.round(Math.random() * (100 - 1) + 1), 'ck': 'NO' }
        }
        // Start the request
        request(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                console.log(body)
            }
        });


        var options = {
            url: 'http://cloud.cm-golega.pt:3000/boxes',
            method: 'POST',
            form: { 'name': 'BoxIoT', 'mac': macaddress, 'model': 'RaspBerryPi 3', 'version': '1.0', 'Serial': Math.round(Math.random() * (10000000000000 - 1) + 1), 'type': 'Sensorbox', 'manuf': 'PT-PT', 'coordN': '0.0', 'coordW': '0.0', 'clientName': 'Teste', 'address': 'Rua sobe', 'code': '2000-000', 'locality': 'Tomar', 'phone': '987654321', 'yearinstall': '2017', 'accept': '1', 'port': '3001' }
        }

        // Start the request
        request(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                console.log(body)
            }
        });


        //const request = require('request');

        options = {
            url: 'http://cloud.cm-golega.pt:3000/boxes',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Accept-Charset': 'utf-8',
                'User-Agent': 'my-reddit-client'
            }
        };

        request(options, function(err, res, body) {
            // var json = JSON.parse(body);
            console.log("Result", body);
        });


        options = {
            url: 'http://cloud.cm-golega.pt:3000/sensors',
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Accept-Charset': 'utf-8',
                'User-Agent': 'my-reddit-client'
            }
        };

        request(options, function(err, res, body) {
            // var json = JSON.parse(body);
            console.log("Result", body);
        });
        // Configure the request

        /*
          var p1 = JSON.stringify({objecttype: 'boxiot', name: 'BoxIoT', mac: macaddress, model: '1.0', version: '1.0', serial: Math.round( Math.random() * (10000000000000 - 1) + 1), type: '1.0', manuf: 'PT-PT', coordN: '0.0', coordW: '0.0', clientName: 'Teste', address: 'Rua sobe', code: '2000-000', locality: 'Tomar', phone:  '987654321', yearinstall: datetime});
          conn.emit('call', p1, function(resp, data) {
            console.log('A Box enviou boxes ' + p1);
          });
          var tiposensor = new Array("Temperatura","Humidade","Luminosidade","Som","Gas","Inundacao","Energia","Porta","Janela");
          //var i = Math.floor(Math.random() * listasensor);

          partAs = new Array(1);
          for (i=0;i<1;i++){
              partAs[i]=tiposensor[Math.round(Math.random()*8)];
          }
          var sensortipo = partAs[0] ;

          var p2 = JSON.stringify({objecttype: 'sensoriot', boxname: 'BoxIoT', boxmac: macaddress, sensorid: '1.0', sensorname: '1.0', sensortype: sensortipo, sensorvalue: Math.round( Math.random() * (100 - 1) + 1)});
          conn.emit('call', p2, function(resp, data) {
            console.log('A Box enviou sensors ' + p2);
          });*/

    // };
}, 5000);

// Receção de Dados JSON do Servidor
// var errorhandler = require('errorhandler');
// var server = http.createServer(app);
// var iolisten = require('socket.io').listen(server);
// var ns = iolisten.of('/ns');
// app.use(express.static(__dirname + '/'));
// app.use(errorhandler()); // development only
// ns.on('connection', function(socket) {
//     socket.on('call', function(p1, fn) {
//         console.log('O Servidor recebeu da Box ' + p1);

//     });
// });
// Fim de receção de Dados JSON do Servidor

// Lê o ficheiro portas.JSON
// fs.readFile('portas.json', 'utf8', function(err, data) {
//     if (err) throw err;
//     var obj = JSON.parse(data);
//     console.log(data);
// });

// O Cliente fica a aguardar por mensagens na porta
// server.listen(3001);