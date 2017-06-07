var http = require('http');
var htmlparser = require('htmlparser2');
var cheerio = require('cheerio');
var request = require('request');
var mongoose = require('mongoose');
fs = require('fs');

var Schema = mongoose.Schema;

var addrSchema = Schema({
    address: String,
    firstLetter: String,
    secondLetter: String
  }),
  addrDB = mongoose.model('addrSchema', addrSchema),

  neighborSchema = Schema({
    address: String,
    from: String,
    status: String
  }),
  neighborDB = mongoose.model('neighborSchema', neighborSchema),

  routeSchema = Schema({
    address: String,
    from: String,
    time: String
  });
  routeDB = mongoose.model('routeSchema', routeSchema);


//Output Variables
var addresses = new Array();
var neighbors = new Array();
var routes = new Array();

var showData = 0;

// READ FILE
var readFile = function (file) {
	//console.log("readFile");
	fs.readFile(file, 'utf8', function (err,data) {
	  if (err) {
	    return console.log(err);
	  }
	  //Coloca os dados nas variaveis
	  parseHtml(data);
	  //Depois de ser preenchido, mostrar
	  if(showData==1){
		  console.log("Addresses:");
		  console.log(addresses);
		  console.log("Neighbors:");
		  console.log(neighbors);
		  console.log("Routes:");
		  console.log(routes);
	  }
          //Insert na BD
          bd();
	});
}


// HTML TO VARS
var parseHtml = function(response) {
  //Variables
  var arr = new Array();
  //Number of properties
  var mult = 0;
  //READ HTML
  var $ = cheerio.load(response);
  
  //H2 - Principal Titles
  $('h2').each(function(i, element){
    //3 Properties
    mult = 3;
    var h2 = $(this);
    var pre = h2.next();
    var preReplaced = "";

    //Retirar algumas tags
    preReplaced = pre.toString().replace(/(\r\n|\r|\n)/g, " ").replace("<pre>","").replace("</pre>","");
    //Passar para array
    arr = preReplaced.split(" ");
    //Retirar posições do array que não importam
    for (var i=arr.length-1; i>=0; i--) {
    	if (arr[i].toString().includes("[<a") || arr[i].toString().includes("href") || arr[i].toString() ==="") {
		arr.splice(i, 1);
    	}
    }

   if(h2.text()=="Addresses"){
	for (var i = 0; i < arr.length/mult ; i++){
		addresses[i] = [arr[i*mult],arr[i*mult+1],arr[i*mult+2]];
	}
    }
   else if(h2.text()=="Neighbors"){

	//3 Properties
	mult = 3;

	for (var i = 0; i < arr.length/mult ; i++){
		neighbors[i] = [arr[i*mult],arr[i*mult+1],arr[i*mult+2]];
	}

    }

    else if(h2.text()=="Routes"){
	mult = 3;

	//Caso tenha alguma das tags a baixo, sai fora do array
	for (var i=arr.length-1; i>=0; i--) {
	    if  (arr[i].toString() ==="s"|| arr[i].toString().includes("via")) {
		arr.splice(i, 1);
	    }
	}

	for (var i = 0; i < arr.length/mult ; i++){
		routes[i] = [arr[i*mult],arr[i*mult+1],arr[i*mult+2]];
	}

    }

  });
 
}

var bd = function (){

	mongoose.connect('mongodb://localhost/BoxIOT', function(err) {
	    if (err) throw err;
	    console.log("Successfully connected to MongoDB");

	    for(var i = 0; i < addresses.length;i++){
		    var addrs = new addrDB({address: addresses[i][0], firstLetter: addresses[i][1], secondLetter:addresses[i][2]});
		    addrs.save(function (err){
			if(err){console.log(err);}
			else{console.log("ok");}
		    });
	    }

	    for(var i = 0; i < neighbors.length;i++){
		    var neighbor = new neighborDB({address: neighbors[i][0], from: neighbors[i][1], status:neighbors[i][2]});
		    neighbor.save(function (err){
			if(err){console.log(err);}
			else{console.log("ok");}
		    });
	    }    

	    for(var i = 0; i < routes.length;i++){
		    var route = new routeDB({address: routes[i][0], from: routes[i][1], time:routes[i][2]});
		    route.save(function (err){
			if(err){console.log(err);}
			else{console.log("ok");}
		    });
	    }   
     
	    mongoose.connection.close();

	  });

}

//------------- functions END   -------------------------------

readFile('./network.html');
