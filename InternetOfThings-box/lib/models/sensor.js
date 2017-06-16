// grab the things we need
var mongoose = require('mongoose'),
    log = require('./../serverlog.js'),
    Schema = mongoose.Schema;

// create a schema Sensor
var sensorSchema = new Schema({
    ip: { type: String },
    temperature: { type: String },
    humidity: { type: String },
    loudness: { type: String },
    light: { type: String }
});

var Sensor = function() {
    this.SensorDB = mongoose.model('Sensor', sensorSchema);
};

Sensor.prototype.insertData = function(data) {
    console.log("Insert");
    var self = this;
    // Recebendo os parâmetros da requisição
    // create a new user
    var newSensorData = self.SensorDB(data);

    // save the user
    newSensorData.save(function(err) {
        if (err) {
            return;
        }
        log.appendToLog('Sensor value add / created!');
        console.log('Sensor value add / created!');
    });
};

module.exports = Sensor;
