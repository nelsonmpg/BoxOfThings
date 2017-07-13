const BN = require('bn.js');
var EC = require('elliptic').ec;
var ec = new EC('p192');
//COAP
var coap = require('coap');
var request = coap.request;
var URL = require('url');

var CryptoJS = require("crypto-js");

//Define os pontos publicos BOX
var OwnX = '11FA2B68851DEDA9B0CE4D6EFD76F4623DD4600FEB5824EF';
var OwnY = '1B2585D62B7E6055C8534362A55F7F4F6EAB50F376CF18CE';
//Gera chave 
var OwnPubKey = { x: OwnX.toString('hex'), y: OwnY.toString('hex') };
//Faz o par de chaves
var OwnKeyPair = ec.keyFromPublic(OwnPubKey, 'hex');
//define chave privada
OwnKeyPair.priv = new BN('A722747CCF51EB381BA75A75A74DF4EB31633C852E0D97EE',16);




function GeraChaveSimetrica(xB,yB) {

	console.log("Mote x:"+ xB.toString('hex'));
	console.log("Mote y:"+ yB.toString('hex'));

	var pubB = { x: xB.toString('hex'), y: yB.toString('hex') };

	var key2 = ec.keyFromPublic(pubB, 'hex');



	//console.log(OwnKeyPair);
	console.log(key2.getPublic());
	//gera chave partilhada
	var shared1 = OwnKeyPair.derive(key2.getPublic());
	console.log("Partilhada "+ shared1.toString(16));

	//PARA POR CHAVE NO MESMO FORMATO DO QUE ESTA NOS MOTES
	var res = shared1.toString(16).match(/.{2}/g);
	var final = ""
	res.reverse().forEach(function(entry, idx, array) {
	  if(idx <16)
	  final += entry;
	});

	console.log(final);
	// FIM - GERAR CHAVE SIMETRICA
  
}