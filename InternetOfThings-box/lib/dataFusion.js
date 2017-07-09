var mongoose = require('mongoose'),
    Sensor = require('./models/sensor.js');

Sensor = new Sensor();

module.exports = {
    getAllSensores: function() {
        Sensor.getDistinctSensores(module.exports.iterateMotes);
    },

    iterateMotes: function(err, nodes) {
        var allNotes = nodes;
        console.log("Teste", allNotes);
        for (var i in allNotes) {
            Sensor.getAllReadingsToSensor(allNotes[i], module.exports.iterateReadingsSensor);
        }
    },

    iterateReadingsSensor: function(entries) {
        console.log("Entries", entries);
    }

};
