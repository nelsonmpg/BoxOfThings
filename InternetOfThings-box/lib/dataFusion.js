var mongoose = require('mongoose'),
Sensor = require('./models/sensor.js'),
SensorDataFusion = require("./models/sensorDataFusion");
var util = require('util');

Sensor = new Sensor();
SensorDataFusion = new SensorDataFusion();

module.exports = {
    getAllSensores: function() {
        // var obj = {
        //     ip: "[456:456:456:456:456]",
        //     metodos : [],
        //     dataVals : {
        //         readingDate : Date.now(),
        //         temperature: (Math.random() * 100).toFixed(2), //(obJson.Temperature.toString() == "00.-1") ? "-1" : obJson.Temperature,
        //         humidity: (Math.random() * 100).toFixed(2), //(obJson.Humidity.toString() == "00.-1") ? "-1" : obJson.Humidity,
        //         loudness: (Math.random() * 100).toFixed(2), //(obJson.Loudness.toString() == "00.-1") ? "-1" : obJson.Loudness,
        //         light: (Math.random() * 100).toFixed(2), //(obJson.Light.toString() == "00.-1") ? "-1" : obJson.Light
        //     }
        // }

        // // console.log("\nSimular insert:\n", obj);
        // Sensor.insertOrUpdate(obj);
        // Sensor.insertSensorMetodos(obj.ip, [ {folder: "teste2",resource : "456456"}, {folder: "teste4",resource : "999999"}]);

        console.log("Start Counter Data Fusion.");
        setTimeout(function() {
            console.log("New call Data Fusion.");
            Sensor.getAllSensores(module.exports.iterateMotes);
            module.exports.getAllSensores();
        }, 5 * 60 * 1000);
    },

    iterateMotes: function(err, nodes) {
        var allNotes = nodes;
        if (allNotes.length > 0) {
            for (var i in allNotes) {
                var validKeys = [];
                var keys = Object.keys(JSON.parse(JSON.stringify(allNotes[i].dataValues[0])));
                for (var k in keys) {
                    if (keys[k] !== "_id" && keys[k] !== "readingDate") {
                        validKeys.push(keys[k]);
                    }
                }
                module.exports.iterateMotesToKeys(validKeys, JSON.parse(JSON.stringify(allNotes[i])));
                Sensor.removeAllRecords('{"ip" : "' + allNotes[i].ip + '"}');
            }
        }
    },

    iterateMotesToKeys: function(keys, mote) {
        var moteResult = {
            moteip: mote.ip,
            dateOfEntry: dateTimeFormat(new Date()),
            readings: []
        };

        for (var key in keys) {
            var valForKey = {
                sensorType: keys[key],
                values: {
                    Average: 0,
                    Max: Number.MIN_VALUE,
                    dateOfMax: new Date(0),
                    Min: Number.MAX_VALUE,
                    dateOfMin: new Date(0),
                    lowerRangeOfReadingDate: Infinity,
                    upperRangeOfReadingDate: -Infinity
                }
            };
            valForKey.values = filterOutliers(mote.dataValues, keys[key], valForKey.values);
            moteResult.readings.push(valForKey);
        }
        console.log(util.inspect(moteResult, false, null, true));
        SensorDataFusion.insertDataFusion(moteResult);
    }
};


//Filtrar o array recebido e retornar sem outliers
function filterOutliers(someArray, key, resultObj) {

    // Copy the values, rather than operating on references to existing values
    var values = someArray;

    // Then sort
    values.sort(function(a, b) {
        return parseFloat(a[key]) - parseFloat(b[key]);
    });

    /* Then find a generous IQR. This is generous because if (values.length / 4) 
     * is not an int, then really you should average the two elements on either 
     * side to find q1.
     */
     var q1 = values[Math.floor((values.length / 4))];
    // Likewise for q3. 
    var ceilVar = Math.ceil((values.length * (3 / 4)));
    var q3 = values[ceilVar > values.length - 1 ? values.length - 1 : ceilVar];
    var iqr = parseFloat(q3[key]) - parseFloat(q1[key]);

    // Then find min and max values - mild outliers are those data points which lay between 1.5 * IRQ and 3 * IRQ
    var maxValue = parseFloat(q3[key]) + iqr * 1.5;
    var minValue = parseFloat(q1[key]) - iqr * 1.5;

    // Then filter anything beyond or beneath these values.
    // var filteredValues = [];
    var averagecalc = 0;
    carcountAverage = 0;
    for (var i = values.length - 1; i >= 0; i--) {
        tmp = parseFloat(values[i][key]);
        if ((tmp <= maxValue) && (tmp >= minValue)) {
            var valaux = (parseFloat(values[i][key]).toFixed(2));
            averagecalc += valaux;
            carcountAverage++;

            if (resultObj.Max < valaux) {
                resultObj.dateOfMax = dateTimeFormat(values[i].readingDate);
                resultObj.Max = valaux;
            }

            if (resultObj.Min > valaux) {
                resultObj.dateOfMin = dateTimeFormat(values[i].readingDate);
                resultObj.Min = valaux;
            }

            if (resultObj.lowerRangeOfReadingDate > parseISOString(values[i].readingDate)) {
                resultObj.lowerRangeOfReadingDate = dateTimeFormat(values[i].readingDate);
            }

            if (resultObj.upperRangeOfReadingDate < parseISOString(values[i].readingDate)) {
                resultObj.upperRangeOfReadingDate = dateTimeFormat(values[i].readingDate);
            }
        }
    }
    resultObj.Average = (averagecalc / carcountAverage).toFixed(2);

    return resultObj;
};

function dateTimeFormat(date) {
    var day;
    try {
        day = date.getDate();
    } catch (e) {
        date = parseISOString(date);
    }
    day = date.getDate();
    if (day.toString().length === 1) {
        day = "0" + day;
    }
    var month = date.getMonth() + 1;
    if (month.toString().length === 1) {
        month = "0" + month;
    }
    var year = date.getFullYear();
    var hour = date.getHours();
    if (hour.toString().length === 1) {
        hour = "0" + hour;
    }
    var minute = date.getMinutes();
    if (minute.toString().length === 1)
        minute = "0" + minute;
    var second = date.getSeconds();
    if (second.toString().length === 1) {
        second = "0" + second;
    }
    var dT = day + "-" + month + "-" + year + " " + hour + ":" + minute + ":" + second;
    return dT;
}

function parseISOString(s) {
    var b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}
