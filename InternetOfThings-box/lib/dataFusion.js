var mongoose = require('mongoose'),
Sensor = require('./models/sensor.js'),
SensorDataFusion = require("./models/sensorDataFusion"),
linuxquery = require("./linuxquery.js"),
timeDatafusion = 1;
var util = require('util');
var sendData = require('./dataToCloud.js');
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
        // var options = {
        //  url: 'http://cloudiot.cm-golega.pt:3000/sensors',
        //  method: 'POST',
        //  form: {
        //     'objecttype': 'sensoriot', 
        //     'boxname': 'BoxIoT', 
        //     'boxmac': macaddress, 
        //     'sensorid': '1.0', 
        //     'sensorname': '1.0', 
        //     'sensortype': sensortipo, 
        //     'sensorvalue': Math.round( Math.random() * (100 - 1) + 1)}
        // }

        // // Start the request
        // request(options, function (error, response, body) {
        //  if (!error && response.statusCode == 200) {
        //  // Print out the response body
        //  console.log(body)
        //  }
        //  });


        // var options = {
        //  url: 'http://cloudiot.cm-golega.pt:3000/boxes',
        //  method: 'POST',
        //  form: {
        //     'objecttype': 'boxiot', 
        //     'name': 'BoxIoT', 
        //     'mac': macaddress, 
        //     'model': '1.0', 
        //     'version': '1.0', 
        //     'serial': Math.round( Math.random() * (10000000000000 - 1) + 1), 
        //     'type': '1.0', 
        //     'manuf': 'PT-PT', 
        //     'coordN': '0.0', 
        //     'coordW': '0.0', 
        //     'clientName': 'Teste', 
        //     'address': 'Rua sobe', 
        //     'code': '2000-000', 
        //     'locality': 'Tomar', 
        //     'phone':  '987654321', 
        //     'yearinstall': datetime}
        // }



        // // Start the request
        // request(options, function (error, response, body) {
        //  if (!error && response.statusCode == 200) {
        //  // Print out the response body
        //  console.log(body)
        //  }
        //  });

        // // console.log("\nSimular insert:\n", obj);
        // Sensor.insertOrUpdate(obj);
        // Sensor.insertSensorMetodos(obj.ip, [ {folder: "teste2",resource : "456456"}, {folder: "teste4",resource : "999999"}]);
        // var obj = {
        //     'objecttype': 'sensoriot', 
        //     'boxname': 'BoxIoT', 
        //     'boxmac': "macaddress", 
        //     'sensorid': '1.0', 
        //     'sensorname': '1.0', 
        //     'sensortype': "sensortipo", 
        //     'sensorvalue': Math.round( Math.random() * (100 - 1) + 1)
        // }
        var obj = {
            boxname: "BoxIotTeste", 
            boxmac: "[123:1234:1234:1324:1342]", 
            moteip: "[3465:3465:3465:3456:3456]",
            methods: [{
                folder: "teste",
                resource: "val1"
            },{
                folder: "teste",
                resource: "val2"
            },{
                folder: "teste",
                resource: "val3"
            },{
                folder: "teste",
                resource: "val4"
            }],
            dateOfEntry: new Date(),
            readings: [{
                sensorType: "temp",
                values: {
                    Average: "12",
                    Max: "23",
                    dateOfMax: new Date(),
                    Min: "12",
                    dateOfMin: new Date(),
                    lowerRangeOfReadingDate: new Date(),
                    upperRangeOfReadingDate: new Date()
                }
            },{
                sensorType: "humy",
                values: {
                    Average: "432",
                    Max: "4334",
                    dateOfMax: new Date(),
                    Min: "34",
                    dateOfMin:new Date(),
                    lowerRangeOfReadingDate: new Date(),
                    upperRangeOfReadingDate: new Date()
                }
            },{
                sensorType: "light",
                values: {
                    Average: "22",
                    Max: "123",
                    dateOfMax: new Date(),
                    Min:"12",
                    dateOfMin: new Date(),
                    lowerRangeOfReadingDate: new Date(),
                    upperRangeOfReadingDate: new Date()
                }
            },{
                sensorType: "sound",
                values: {
                    Average: "232",
                    Max: "43",
                    dateOfMax: new Date(),
                    Min: "43",
                    dateOfMin: new Date(),
                    lowerRangeOfReadingDate: new Date(),
                    upperRangeOfReadingDate: new Date()
                }
            }]
        }

        sendData.sendDataToCloud(obj);

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
