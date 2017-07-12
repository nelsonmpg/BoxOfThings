var net = require('net');
var HOST = 'localhost';
var PORT = 30001; 

var client = new net.Socket();

client.connect(PORT, HOST, function() {
	console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    client.write(JSON.stringify({request:"single_mote_all_info",params: { moteIp:"[aaaa::212:4b00:60d:60fe]"}}));
    client.write(JSON.stringify({request:"single_mote_all_info",params: { moteIp:"[aaaa::212:4b00:60d:b305]"}}));


    client.write(JSON.stringify({request:"single_mote_single_info",params: { moteIp:"[aaaa::212:4b00:60d:60fe]", resource : "Temperature"}}));
    client.write(JSON.stringify({request:"single_mote_single_info",params: { moteIp:"[aaaa::212:4b00:60d:b305]", resource : "Temperature"}}));

    client.write(JSON.stringify({request:"mote_action",params: { moteIp:"[aaaa::212:4b00:60d:60fe]", resource : "LedGreen", color :"g", mode : "on"}}));
    client.write(JSON.stringify({request:"mote_action",params: { moteIp:"[aaaa::212:4b00:60d:b305]", resource : "LedGreen", color :"g", mode : "on"}}));
});

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
var cont = 1;
client.on('data', function(data) {
	console.log('DATA: ' + data);

	// setTimeout(function(){
		client.write(JSON.stringify({aa:cont, zz:cont++}));
	// }, 3000);
   client.destroy();
});

// Add a 'close' event handler for the client socket
client.on('close', function() {
	console.log('Connection closed');
});

