var mongoose = require('mongoose'),
    Sensor = require('./models/sensor.js');

Sensor = new Sensor();

module.exports = {
    getAllSensores: function() {
        Sensor.getDistinctSensores(module.exports.iterateMotes);
    },

    iterateMotes: function(err, nodes) {
        console.log("Teste", nodes);
    }

};
