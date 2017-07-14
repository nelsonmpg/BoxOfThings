var mongoose = require('mongoose'),
    Sensor = require('./models/sensor.js'),
    SensorDataFusion = require("./models/sensorDataFusion"),
    linuxquery = require("./linuxquery.js"),
    timeDatafusion = 1,
    util = require('util');
var sendData = require('./dataToCloud.js');

Sensor = new Sensor();
SensorDataFusion = new SensorDataFusion();

module.exports = {

    getAllSensores: function() {
        console.log("Start Counter Data Fusion.");
        setTimeout(function() {
            console.log("New call Data Fusion.");
            timeDatafusion = linuxquery.getJsonTime("datafusion");
            console.log("Time to new call data Fusion", timeDatafusion);
            Sensor.getAllSensores(module.exports.iterateMotes);
            module.exports.getAllSensores();
        }, timeDatafusion * 60 * 1000);
    },

    iterateMotes: function(err, nodes) {
        var allNotes = nodes;
        if (allNotes.length > 0) {
            for (var i in allNotes) {
                if (allNotes[i].ck) {
                    var validKeys = [];
                    if (allNotes[i].dataValues.length > 0) {
                        var keys = Object.keys(JSON.parse(JSON.stringify(allNotes[i].dataValues[0])));
                        for (var k in keys) {
                            if (keys[k] !== "_id" && keys[k] !== "readingDate") {
                                validKeys.push(keys[k]);
                            }
                        }
                    }
                } else {
                    console.log("---------------------------->> Sensor not valid!");
                }
                module.exports.iterateMotesToKeys(validKeys, JSON.parse(JSON.stringify(allNotes[i])));
                Sensor.removeAllRecords({ "ip": allNotes[i].ip });
            }
        } else {
            console.log("No Records to DataFusion.");
        }
    },

    iterateMotesToKeys: function(keys, mote) {
console.log("-----------------------------------------------------------------------------------------------");
console.log("----------------------------------- Teste", keys, mote);
console.log("-----------------------------------------------------------------------------------------------");

        var moteResult = {
            boxname: linuxquery.getRemoteHostVals("boxname"),
            boxmac: linuxquery.getRemoteHostVals("boxmac"),
            moteip: mote.ip,
            methods: mote.methods,
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
    var averagecalc = 0.0;
    var countAverage = 0;
    for (var i = values.length - 1; i >= 0; i--) {
        tmp = parseFloat(values[i][key]);
        if ((tmp <= maxValue) && (tmp >= minValue)) {
            var valAux = parseFloat(values[i][key]).toFixed(2);
            averagecalc += valAux * 1;
            countAverage++;

            if (resultObj.Max < valAux) {
                resultObj.dateOfMax = dateTimeFormat(values[i].readingDate);
                resultObj.Max = valAux;
            }

            if (resultObj.Min > valAux) {
                resultObj.dateOfMin = dateTimeFormat(values[i].readingDate);
                resultObj.Min = valAux;
            }

            if (resultObj.lowerRangeOfReadingDate > parseISOString(values[i].readingDate)) {
                resultObj.lowerRangeOfReadingDate = dateTimeFormat(values[i].readingDate);
            }

            if (resultObj.upperRangeOfReadingDate < parseISOString(values[i].readingDate)) {
                resultObj.upperRangeOfReadingDate = dateTimeFormat(values[i].readingDate);
            }
        }
    }
    resultObj.Average = (averagecalc / countAverage).toFixed(2);

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
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();

    return year + "-" +
        (month.toString().length === 1 ? "0" + month : month) + "-" +
        (day.toString().length === 1 ? "0" + day : day) + " " +
        (hour.toString().length === 1 ? "0" + hour : hour) + ":" +
        (minute.toString().length === 1 ? "0" + minute : minute) + ":" +
        (second.toString().length === 1 ? "0" + second : second);
}

function parseISOString(s) {
    var b = s.split(/\D+/);
    return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
}
