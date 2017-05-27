var net = require('net');

var HOST = 'localhost';
var PORT = 3000;
var cont = 100;
// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function(sock) {

    // We have a connection - a socket object is assigned to the connection automatically
    console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort);

    // Add a 'data' event handler to this instance of socket
    sock.on('data', function(data) {

    	console.log('DATA ' + sock.remoteAddress + ': ' + data);

    	setTimeout(function(){
    		sock.write(JSON.stringify({aa:cont, zz:cont++}));
    	}, 3000);
    });

    // Add a 'close' event handler to this instance of socket
    sock.on('close', function(data) {
    	console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });
