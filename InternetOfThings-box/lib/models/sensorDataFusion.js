var mongoose = require('mongoose'),
Schema = mongoose.Schema,
sendData = require('./../dataToCloud.js');

// create a schema para DataFusion
var sensorDataFusionSchema = new Schema({
    boxname: { type: String }, 
    boxmac: { type: String }, 
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
    var self = this;
    var newSensorDataFusion = self.SensorDataFusionDB(data);

    // save the user
    newSensorDataFusion.save(function(err, result) {
        if (err) {
            console.log("Error", err);
            return;
        }
        console.log('Sensor Data Fusion value add / created!' /*, result*/ );
        // sendData.sendDataToCloud(data, 'datafusion');
        sendData.sendDataToCloudParcial(data);
    });
};

module.exports = SensorDataFusion;
