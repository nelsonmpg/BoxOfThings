var express = require('express'),
    fs = require('fs'),
    utils = require('./utils'),
    cp = require('child_process'),
    bodyParser = require('body-parser'),
    net = require('net'),
    HOST = 'localhost',
    PORT = 1000;

var client2 = new net.Socket();

client2.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // Write a message to the socket as soon as the client is connected, the server will receive $

});


// client.connect(PORT, HOST, function() {
//     console.log('CONNECTED TO: ' + HOST + ':' + PORT);
//     // Write a message to the socket as soon as the client is connected, the server will receive $
//     client.write(JSON.stringify({ test: "teste", as: "asd" }));
// });

// Add a 'data' event handler for the client socket
// data is what the server sent to this socket
client2.on('data', function(data) {
    console.log('DATA: ' + data);

    client.write(JSON.stringify({ aa: cont, zz: cont++ }));

    //    client.destroy();
});

// Add a 'close' event handler for the client socket
client2.on('close', function() {
    console.log('Connection closed');
});



var app = express();

app.use(express.static('./public'));
app.use(bodyParser.json());

app.get('/teste', function(req, res) {

    // client2.write(JSON.stringify({req: req, res:res}));

    console.log("teste");
    res.send({
        'status': 'ok',
        'stdout': "output.stdout.toString()",
        'stderr': "output.stderr.toString()",
    });
});


app.listen(8080, function() {
    console.log('Dashboard listening on port ' + 8080);
});
