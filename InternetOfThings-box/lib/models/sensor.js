// grab the things we need
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// create a schema Sensor
var sensorSchema = new Schema({
    ip: { type: String },
    metodos: [{
        folder: { type: String },
        resource: { type: String }
    }],
    dataValues: [{
        readingDate: { type: Date, default: Date.now },
        temperature: { type: String },
        humidity: { type: String },
        loudness: { type: String },
        light: { type: String },
        teste: { type: String }
    }]
});

var Sensor = function() {
    this.SensorDB = mongoose.model('Sensor', sensorSchema);
};

Sensor.prototype.insertData = function(data) {
    // console.log("Insert");
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
        console.log('Sensor value add / created!');
    });
};

Sensor.prototype.insertOrUpdate = function(data) {
    var self = this;
    self.SensorDB.update({ "ip": data.ip }, { $push: { dataValues: data.dataVals } }, { upsert: true }, function(err, result) {
        if (err) {
            return;
        }
        console.log('Sensor value add / created!', result);
    });
};

Sensor.prototype.getAllSensores = function(callback) {
    this.SensorDB.find({}, callback);
};

Sensor.prototype.removeAllRecords = function(params) {
    this.SensorDB.remove(params, function(err, result) {
        if (err) {
            console.log("Error to remove all");
            return;
        }
        console.log("Remove all records", result);
    });
};

Sensor.prototype.insertSensorMetodos = function(moteip, sensorMetodos) {
    this.SensorDB.update({ "ip": moteip }, { $set: { metodos: sensorMetodos } }, { upsert: true }, function(err, result) {
        if (err) {
            return;
        }
        console.log('Sensor metodos add / created!', result);
    });

};

module.exports = Sensor;
