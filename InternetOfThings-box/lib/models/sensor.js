// grab the things we need
var mongoose = require('mongoose'),
    log = require('./../serverlog.js'),
    Schema = mongoose.Schema;

// create a schema Sensor
var sensorSchema = new Schema({
    ip: { type: String },
    readingDate: { type: Date, default: Date.now },
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
    data.readingDate = Date.now();
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

Sensor.prototype.getDistinctSensores = function(callback) {
    this.SensorDB.distinct("ip", callback);
};

Sensor.prototype.getoneToGetKeys = function(ip){
    this.SensorDB.findOne({ "ip": ip }, callback)
};

Sensor.prototype.getAllReadingsToSensor = function(ip, callback) {
    this.SensorDB.find({ "ip": ip }, callback);
};

module.exports = Sensor;
