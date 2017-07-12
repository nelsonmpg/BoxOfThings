var mongoose = require('mongoose'),
Schema = mongoose.Schema;
var http = require('http');

var sensorDataFusionSchema = new Schema({
    moteip: { type: String },
    methods: [{
        folder: { type: String },
        resource: { type: String }
    }],
    dateOfEntry: { type: Date, default: Date.now },
    readings: [{
        sensorType: { type: String },
        values: {
            Average: { type: Number },
            Max: { type: Number },
            dateOfMax: { type: Date },
            Min: { type: Number },
            dateOfMin: { type: Date },
            lowerRangeOfReadingDate: { type: Date },
            upperRangeOfReadingDate: { type: Date }
        }
    }]
});


var SensorDataFusion = function() {
    this.SensorDataFusionDB = mongoose.model('SensorDataFusion', sensorDataFusionSchema);
};

SensorDataFusion.prototype.insertDataFusion = function(data) {
    console.log("Insert");
    var self = this;
    // Recebendo os parâmetros da requisição
    // create a new user
    var newSensorDataFusion = self.SensorDataFusionDB(data);

    // save the user
    newSensorDataFusion.save(function(err, result) {
        if (err) {
            console.log("Error", err);
            return;
        }
        console.log('Sensor Data Fusion value add / created!'/*, result*/);

        var options = {
            host: "172.16.132.92",
            port: 4000,
            path: '/Teste',
            method: 'GET'
        };

        http.request(options, function(res) {
          console.log('STATUS: ' + res.statusCode);
          console.log('HEADERS: ' + JSON.stringify(res.headers));
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
        });
      }).end();


    });
};

module.exports = SensorDataFusion;
