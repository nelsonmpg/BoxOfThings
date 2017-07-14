// exemplo de valores para o insert nos sensores --------------------
var obj = {
    ip: "[456:456:456:456:456]",
    dataVals: {
        readingDate: utils.dateTimeFormat(new Date()),
        temperature: (Math.random() * 100).toFixed(2), 
        humidity: (Math.random() * 100).toFixed(2), 
        loudness: (Math.random() * 100).toFixed(2), 
        light: (Math.random() * 100).toFixed(2), 
}
};

Sensor.insertOrUpdate(obj);
// ------------------- Fim Exemplo insert nos sensores -------------------

// -----------  Exeplo de insert no data fusion ----------------------
var obj = {
    boxname: linuxquery.getRemoteHostVals("boxname"), 
    boxmac: linuxquery.getRemoteHostVals("boxmac"), 
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
            dateOfMax: utils.dateTimeFormat(new Date()),
            Min: "12",
            dateOfMin: utils.dateTimeFormat(new Date()),
            lowerRangeOfReadingDate: utils.dateTimeFormat(new Date()),
            upperRangeOfReadingDate: utils.dateTimeFormat(new Date())
    }
},{
        sensorType: "humy",
        values: {
            Average: "432",
            Max: "4334",
            dateOfMax: utils.dateTimeFormat(new Date()),
            Min: "34",
            dateOfMin: utils.dateTimeFormat(new Date()),
            lowerRangeOfReadingDate: utils.dateTimeFormat(new Date()),
            upperRangeOfReadingDate: utils.dateTimeFormat(new Date())
    }
},{
        sensorType: "light",
        values: {
            Average: "22",
            Max: "123",
            dateOfMax: utils.dateTimeFormat(new Date()),
            Min:"12",
            dateOfMin: utils.dateTimeFormat(new Date()),
            lowerRangeOfReadingDate: utils.dateTimeFormat(new Date()),
            upperRangeOfReadingDate: utils.dateTimeFormat(new Date())
    }
},{
        sensorType: "sound",
        values: {
            Average: "232",
            Max: "43",
            dateOfMax: utils.dateTimeFormat(new Date()),
            Min: "43",
            dateOfMin: utils.dateTimeFormat(new Date()),
            lowerRangeOfReadingDate: utils.dateTimeFormat(new Date()),
            upperRangeOfReadingDate: utils.dateTimeFormat(new Date())
    }
}]
};
SensorDataFusion.insertDataFusion(obj);

// fim exemplo insert no data fuvion ---------------------

// call post datafusion full object ---------------------
sendData.sendDataToCloudDataFusion(obj, 'sensors');

// call post parcial datafusion ------------------------ 
sendData.sendDataToCloudParcial(obj, 'sensors');

