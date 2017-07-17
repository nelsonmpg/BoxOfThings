// grab the things we need
var mongoose = require('mongoose'),
Schema = mongoose.Schema,
dataToCloud = require("./../dataToCloud.js");

// create a schema Sensor
var sensorSchema = new Schema({
    ip: { type: String },
    ck: { type: Boolean, default: false },
    pubX: { type: String },
    pubY: { type: String },
    secret: { type: String },
    methods: [{
        folder: { type: String },
        resource: { type: String }
    }],
    dataValues: [{
        readingDate: { type: Date, default: Date.now },
        temperature: { type: String },
        humidity: { type: String },
        loudness: { type: String },
        light: { type: String },
        co: { type: String },
        co2: { type: String }
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
        if (result.nModified == 0) {
            self.SensorDB.update({ "ip": data.ip }, { $set: { ck: false, pubX: "", pubY: "", secret: "" } }, { upsert: true }, function(err, result) {
                if (err) {
                    console.log("error to update sensor.");
                    return;
                }
                console.log('Sensor keys and ck update!', result);
                self.getSensorNotCheck();
            });
        }
    });
};

Sensor.prototype.getSensorNotCheck = function() {
    this.SensorDB.find({ "ck": false }, function(err, result) {
        if (err) {
            return;
        }
        console.log('*********************************>> Motes NotCheck' /*, result*/ );
        dataToCloud.sendToCheckSensoresValidate(result);
    });
};

Sensor.prototype.getActiveSensors = function(res) {
    this.SensorDB.find({ ck: true }, { ip: 1 }, function(err, result) {
        if (err) {
            res.json({
                status : "sensors error",
                stdout : err
            });
            return;
        }
        res.json({
                status : "sensors ok",
                stdout : result
            });
    });
};

Sensor.prototype.updateCheckedAndKeysSensor = function(vals, res) {
    this.SensorDB.update({ "ip": vals.moteip }, { $set: { "ck": vals.ck, pubX: vals.pubX, pubY: vals.pubY, secret: vals.secret } }, { upsert: true }, function(err, result) {
        if (err) {
            console.log("Error to update sensor.");
            res.write(JSON.stringify({ "status": "Error" }));
            return;
        }
        console.log('Sensor check update!' /*, result*/ );
        res.write(JSON.stringify({ "status": "ok" }));
    });
};

Sensor.prototype.getMoteCommands = function(mote, res) {
    this.SensorDB.find({ "ip": mote },{methods : 1}, function(err, methods) {
        if (err) {
            console.log("Error load methods.");
            res.json({
                status : "methods error",
                stdout : err
            });
            return;
        }
        res.json({
            status : "methods ok",
            stdout : methods
        });
    });
};

Sensor.prototype.getAllSensores = function(callback) {
    this.SensorDB.find({}, callback);
};

Sensor.prototype.getSensorsAndKey = function(callback) {
    this.SensorDB.find({ ck: true }, { ip: 1, secret: 1 }, callback);
};

Sensor.prototype.removeAllRecords = function(params) {
    console.log(params);
    this.SensorDB.update(params, { $set: { dataValues: [] } }, { upsert: true }, function(err, result) {
        if (err) {
            console.log("Error to remove all");
            return;
        }
        console.log("+++++++++++++++++++++++++++> Remove all records" /*, result*/ );
    });
};

Sensor.prototype.insertSensorMethods = function(moteip, sensorMetodos) {
    this.SensorDB.update({ "ip": moteip }, { $set: { methods: sensorMetodos } }, { upsert: true }, function(err, result) {
        if (err) {
            console.log("error to insert methods.")
            return;
        }
        console.log('Sensor methods add / created!' /*, result*/ );
    });

};

module.exports = Sensor;