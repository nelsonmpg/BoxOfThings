var express = require('express'),
    fs = require('fs'),
    cp = require('child_process'),
    bodyParser = require('body-parser');


var app = express();

app.use(express.static('./public'));
app.use(bodyParser.json());

app.post("/sensors", function(req, res) {
    console.log("Receive '/sensors'", req.body);
    res.send({'status': 'sensors ok', 'stdout': new Date()});
});

app.post("/sensorscheck", function(req, res) {
    console.log("Receive '/sensorscheck'", req.body);
    res.send({ 'status': 'sensorscheck ok', 'stdout': new Date()});
});


app.post("/boxes", function(req, res) {
    console.log("Receive", req.body);
    res.send({ 'status': 'boxes ok', 'stdout': new Date(), 'stderr': new Date()});
});

app.post("/boxes", function(req, res) {
    console.log("Receive '/boxes'", req.body);
    res.send({ 'status': 'boxes ok', 'stdout': new Date()});
});

app.get('/sensors', function(req, res) {
    res.send("Hello World! '/sensors'" + new Date().toString() + ' - ' + process.env.PORT);
});

app.get('/sensorscheck', function(req, res) {
    res.send("Hello World! '/sensorscheck'" + new Date().toString() + ' - ' + process.env.PORT);
});

var port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log('Dashboard listening on port ' + port);
});