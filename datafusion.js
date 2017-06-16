//Vai correr em intervalo de tempo, dado na variavel minutes
var minutes = 15, the_interval = minutes * 60 * 1000;
setInterval(function() { 
	var MongoClient = require('mongodb').MongoClient
		, assert = require('assert');
	var url = 'mongodb://localhost:27017/myproject';
	const util = require('util');

	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		if (err) throw err;
		var collection = db.collection('readings');
		collection.find({}).toArray(function(err, result) {
		  if (err) throw err;

			//Construção da data
		  var date = new Date();
			var nullDate = new Date(0);
			var dateTime = dateTimeFormat(date);

			//Aqui pomos na variavel nodes todos os valores únicos de nós, obtendo assim a quantidade de nós unicos
		  collection.distinct("moteid",(function(err, nodes){

				//depois percorremos a variavel values, que contem os todos os dados na collection Readings da BD, contra cada nó
		    nodes.forEach(function(values) {
					
					//ir buscar os tipos de sensores para o nó do foreach
					var arrEntriesTypes = [];
					result.forEach(function(entries) {
						for (key in entries) {
							if(entries.moteid == values) {
								if(key != "_id" && key != "moteid" && key != "readingDate") {
									if(arrEntriesTypes.length == 0) {
										arrEntriesTypes.push(key);
									} else {
										var count = 0;
										arrEntriesTypes.forEach(function(testType) {
											if(testType == key) {
												count = count + 1;
											}
										})
										if(count <= 0) {
											arrEntriesTypes.push(key);
										}
									}
								}
							}
						}
					})

					//depois criar o array com objectos de leituras deste sensor
					var arrSensor = [];
					arrEntriesTypes.forEach(function(readingType) {
						//entries contém os dados completos da collection
						result.forEach(function(entries) {
							//se pertencer ao nó em questão
							if(entries.moteid == values) {
								for (key in entries) {
									if(key == readingType) {
										var tmp = entries[readingType];
										var myObj = {modeid: entries.moteid, type: key, reading: tmp, dateOfReading: entries.readingDate};
										arrSensor.push(myObj); //array com as leituras deste sensor, type com o tipo, reading com o valor e dateofreading com a data
									}
								}
							}
						})
					})					
					
					//finalmente vamos para o nó em questão, para cada tipo de leitura, fazer os cálculos
					var arrReadingNode = [];
					arrEntriesTypes.forEach(function(readingType) {

						//primeiro criar um array para cada tipo de leitura
						arrReading = [];
						arrSensor.forEach(function(sensorReading) {
							if(readingType == sensorReading.type) {
								var myObj = {value: sensorReading.reading, dateOfReading: sensorReading.dateOfReading};
								arrReading.push(myObj);
							}
						})

						//depois de ter construido o array para o sensor, que está a ser percorrido no foreach, fazer as operações
						if(arrReading.length > 0) {
							//Outliers
							var filteredArray = filterOutliers(arrReading);
							//Soma dos valores...
							var fsum = 0.0;
							for (var i=filteredArray.length-1; i>=0; i--) {
								fsum = fsum + parseFloat(filteredArray[i].value);
							}
							//.. para cálculo da média
							var favg = (fsum / filteredArray.length).toFixed(2);
							//encontrar o máx..
							var fmax = (arrayMax(filteredArray));
							var maxValue = parseFloat((fmax.value)).toFixed(2);
							var maxDate = dateTimeFormat(fmax.dateOfReading);
							//e o min..
							var fmin = (arrayMin(filteredArray));
							var minValue = parseFloat((fmin.value)).toFixed(2);
							var minDate = dateTimeFormat(fmin.dateOfReading);
							//e o range de datas de leitura - duvida se ponho o array filtrado ou ainda o original...
							var rangeDateMin = dateRangeMin(filteredArray);
							var rangeDateMax = dateRangeMax(filteredArray);
						
						} else {
							var favg = '0.0', maxValue = '0.0', minValue = '0.0';
							var maxDate = dateTimeFormat(nullDate);
							var minDate = dateTimeFormat(nullDate);
							var rangeDateMin = dateTimeFormat(nullDate);
							var rangeDateMax = dateTimeFormat(nullDate);
						}

						//criar objecto com as leituras
						var allReadingsObj = {Average: favg, Max: maxValue, dateOfMax: maxDate,
							Min: minValue, dateOfMin: minDate, 
							lowerRangeOfReadingDate: rangeDateMin, upperRangeOfReadingDate: rangeDateMax};
						var readingObj = {sensorType: readingType, values: allReadingsObj};
						arrReadingNode.push(readingObj);
					})
					
					//objecto escrito na BD
					var myEntry = {nodeId: values, readings: arrReadingNode, dateOfEntry: dateTime};
					console.log(util.inspect(myEntry, false, null))

					//inserir o registo na nova collection readingsFusedData
					var MongoClientFinal = require('mongodb').MongoClient
						, assert = require('assert');
					MongoClient.connect(url, function(err, db) {
						assert.equal(null, err);
						if (err) throw err;
						var collectionFinal = db.collection('readingsFusedData');
						collectionFinal.insertOne(myEntry, function(err, res) {
							if (err) throw err;
							console.log("1 record inserted for node : " + values + " at " + dateTime);
							db.close();
						});
					});

		    });
		  }))

			//limpa a collection readings - DADOS RAW
			collection.remove({}, function(err) {
				if(err) console.log(err);
				db.close();
			});
		});
	});
}, the_interval);

//Filtrar o array recebido e retornar sem outliers
function filterOutliers(someArray) {  

  // Copy the values, rather than operating on references to existing values
  var values = someArray;
	
  // Then sort
  values.sort( function(a, b) {
    return parseFloat(a.value) - parseFloat(b.value);
	});

  /* Then find a generous IQR. This is generous because if (values.length / 4) 
   * is not an int, then really you should average the two elements on either 
   * side to find q1.
   */
	var q1 = values[Math.floor((values.length / 4))];
  // Likewise for q3. 
  var q3 = values[Math.ceil((values.length * (3 / 4)))];
  var iqr = parseFloat(q3.value) - parseFloat(q1.value);

  // Then find min and max values - mild outliers are those data points which lay between 1.5 * IRQ and 3 * IRQ
  var maxValue = parseFloat(q3.value) + iqr * 1.5;
  var minValue = parseFloat(q1.value) - iqr * 1.5;

  // Then filter anything beyond or beneath these values.
  var filteredValues = [];
	for (var i=values.length-1; i>=0; i--) {
		tmp = parseFloat(values[i].value);
		if ((tmp <= maxValue) && (tmp >= minValue)) {
			filteredValues.push(values[i]);
		}
	}
  // Then return the filtered object array
  return filteredValues;
};

//retorna o registo com o valor minimo do array
function arrayMin(arr) {
  var len = arr.length, tmp;
	var min = arr[len-1];
	for (var i=len-1; i>=0; i--) {
		tmp = parseFloat(arr[i].value);
		if (tmp < min.value) {
			min = arr[i];
		}
	}
  return min;
};

//retorna o registo com o valor maximo do array
function arrayMax(arr) {
  var len = arr.length, tmp;
	var max = arr[len-1];
	for (var i=len-1; i>=0; i--) {
		tmp = parseFloat(arr[i].value);
		if (tmp > max.value) {
			max = arr[i];
		}
	}
  return max;
};

//formatar uma data recebida
function dateTimeFormat(date) {
	var day = date.getDate();
  if (day.toString().length == 1)
    day = "0"+day;
  var month = date.getMonth()+1;
  if (month.toString().length == 1)
    month = "0"+month;
  var year = date.getFullYear();  
	var hour = date.getHours();
	if (hour.toString().length == 1)
    hour = "0"+hour;
	var minute = date.getMinutes();
	if (minute.toString().length == 1)
    minute = "0"+minute;
	var second = date.getSeconds();
	if (second.toString().length == 1)
    second = "0"+second;
	var dT =  day + "-" + month + "-" + year + " " + hour + ":" + minute + ":" + second;
	return dT;
}

//de um array retornar a data mais antiga
function dateRangeMin(arr) {
	var len = arr.length, minDate = Infinity;
	for (var i=len-1; i>=0; i--) {
		tmp = arr[i].dateOfReading;
		if (tmp < minDate) {
			minDate = tmp;
		}
	}
	var dateRange = dateTimeFormat(minDate);
	return dateRange;
}

//de um array retornar a data mais recente
function dateRangeMax(arr) {
	var len = arr.length, maxDate = -Infinity;
	for (var i=len-1; i>=0; i--) {
		tmp = arr[i].dateOfReading;
		if (tmp > maxDate) {
			maxDate = tmp;
		}
	}
	var dateRange = dateTimeFormat(maxDate);
	return dateRange;
}
