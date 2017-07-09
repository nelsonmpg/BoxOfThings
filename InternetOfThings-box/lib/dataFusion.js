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
            Sensor.getOneToGetKeys(allNotes[i], module.exports.listKeysReadings);
        }
    },

    listKeysReadings: function(mote) {
        console.log("Entries", mote);
    },

    iterateReadingsSensor: function() {

    }

};
