var net = require('net');

var HOST = 'localhost';
var PORT = 8000;

var client = new net.Socket();
client.connect(PORT, HOST, function() {
	console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive $
    client.write(JSON.stringify({test:"teste",as:"asd"}));
});

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
var cont = 1;
client.on('data', function(data) {
	console.log('DATA: ' + data);

	setTimeout(function(){
		client.write(JSON.stringify({aa:cont, zz:cont++}));
	}, 3000);
//    client.destroy();
});

// Add a 'close' event handler for the client socket
client.on('close', function() {
	console.log('Connection closed');
});

