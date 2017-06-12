// grab the things we need
var mongoose = require('mongoose'),
    Schema = mongoose.Schema
log = require('./serverlog.js'), ;

// create a schema Sensor
var sensorSchema = new Schema({
    name: { type: String },
    ip: { type: String },
    value: { type: String },
    created_at: { type: Date }
});

var Sensor = function() {
    this.SensorDB = mongoose.model('Sensor', sensorSchema);
};

Sensor.prototype.insertData = function(data) {

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
