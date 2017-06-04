// node couldRunFreePort.js 1000 BoxIot-9999

var fp = require("find-free-port");

var port = process.argv.slice(2)[0] || 1000;
var namebox = process.argv.slice(3)[0] || 'BoxIot-9999';

fp(port, function(err, freePort){
	console.log(JSON.stringify({port:freePort, namebox: namebox}));
});
