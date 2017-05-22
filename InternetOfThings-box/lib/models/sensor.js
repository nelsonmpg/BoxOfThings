// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var self = this;

// create a schema
var sensorSchema = new Schema({
    name: {type: String} ,
    ip: {type: String} ,
    value : {type: String} ,
    created_at: {type: Date}
});

var Sensor = function(cfg){
	var self = this;
    this.SensorDB = mongoose.model('Sensor', sensorSchema);

    self.config = cfg;
    // connect to mongo db
    this.connStr = self.config.dataBaseType + '://' + self.config.host + '/Sensors';
    mongoose.connect(this.connStr, function(err) {
        if (err) {
            throw err;
        }
        console.log("Successfully connected to MongoDB");
    });
}

Sensor.prototype.insertData = function(data){
	var self = this;
    // Recebendo os parâmetros da requisição
    // create a new user
    var newSensorData = this.SensorDB(data);

    // save the user
    newSensorData.save(function(err) {
        if (err) {
            return;
        }
        console.log('Sensor value add / created!');    
    });
};

module.exports = Sensor;