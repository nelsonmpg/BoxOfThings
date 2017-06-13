//Vai correr em intervalo de tempo, dado na variavel minutes
var minutes = 15, the_interval = minutes * 60 * 1000;
setInterval(function() { 
	var MongoClient = require('mongodb').MongoClient
		, assert = require('assert');
	var url = 'mongodb://localhost:27017/myproject';

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
		  console.log("Run Date: " + dateTime);

			//Aqui pomos na variavel nodes todos os valores únicos de nós, obtendo assim a quantidade de nós unicos
		  collection.distinct("moteid",(function(err, nodes){
		    //console.log(nodes);

				//depois percorremos a variavel values, que contem os todos os dados na collection Readings da BD, contra cada nó
		    nodes.forEach(function(values) {
					var arrTemp = []; //utilizar arrays para concretizar as  
					var arrHum = []; //operacoes com outliers e maximos e minimos
					var arrSound = []; //existem 4 ensores: temperatura,
					var arrLumi = []; //humidade, sonoro e luminosidade

					//E para cada nó criamos arrays com os valores das variaveis contidas para cálculo de outliers, maximo, minimo e média
					result.forEach(function(entries) {
						if(entries.moteid == values) {
							if (entries.temperature != null) {
								var myObjTemp = {value: entries.temperature, dateOfReading: entries.readingDate};
								arrTemp.push(myObjTemp);					
						  };
						  if (entries.humidity != null) {
								var myObjHum = {value: entries.humidity, dateOfReading: entries.readingDate};
								arrHum.push(myObjHum);
						  };
							if (entries.sound != null) {
								var myObjSound = {value: entries.sound, dateOfReading: entries.readingDate};
								arrSound.push(myObjSound);					
						  };
						  if (entries.luminosity != null) {
								var myObjLumi = {value: entries.luminosity, dateOfReading: entries.readingDate};
								arrLumi.push(myObjLumi);
						  };
						};
					});
					//Temperatura
					if(arrTemp.length > 0) {
						//Outliers
						var filteredTempArray = filterOutliers(arrTemp);
						//Soma das temperaturas...
						var fsumTemp = 0.0;
						for (var i=filteredTempArray.length-1; i>=0; i--) {
							fsumTemp = fsumTemp + parseFloat(filteredTempArray[i].value);
						}
						//.. para cálculo da média
						var favgTemp = (fsumTemp / filteredTempArray.length).toFixed(2);
						//encontrar o máx..
						var fmaxTemp = (arrayMax(filteredTempArray));
						var maxTempValue = parseFloat((fmaxTemp.value)).toFixed(2);
						var maxTempDate = dateTimeFormat(fmaxTemp.dateOfReading);
						//e o min..
						var fminTemp = (arrayMin(filteredTempArray));
						var minTempValue = parseFloat((fminTemp.value)).toFixed(2);
						var minTempDate = dateTimeFormat(fminTemp.dateOfReading);
						//e o range de datas de leitura - duvida se ponho o array filtrado ou ainda o original...
						var rangeTempDateMin = dateRangeMin(filteredTempArray);
						var rangeTempDateMax = dateRangeMax(filteredTempArray);
					} else {
						var favgTemp = '0.0', maxTempValue = '0.0', minTempValue = '0.0';
						var maxTempDate = dateTimeFormat(nullDate);
						var minTempDate = dateTimeFormat(nullDate);
						var rangeTempDateMin = dateTimeFormat(nullDate);
						var rangeTempDateMax = dateTimeFormat(nullDate);
					}

					//Humidade
					if(arrHum.length > 0) {
						//Outliers
						var filteredHumArray = filterOutliers(arrHum);
						//Soma...
						var fsumHum = 0.0;
						for (var i=filteredHumArray.length-1; i>=0; i--) {
							fsumHum = fsumHum + parseFloat(filteredHumArray[i].value);
						}
						//.. para cálculo da média
						var favgHum = (fsumHum / filteredHumArray.length).toFixed(2);
						//encontrar o máx..
						var fmaxHum = (arrayMax(filteredHumArray));
						var maxHumValue = parseFloat((fmaxHum.value)).toFixed(2);
						var maxHumDate = dateTimeFormat(fmaxHum.dateOfReading);
						//e o min..
						var fminHum = (arrayMin(filteredHumArray));
						var minHumValue = parseFloat((fminHum.value)).toFixed(2);
						var minHumDate = dateTimeFormat(fminHum.dateOfReading);
						//e o range de datas de leitura - duvida se ponho o array filtrado ou ainda o original...
						var rangeHumDateMin = dateRangeMin(filteredHumArray);
						var rangeHumDateMax = dateRangeMax(filteredHumArray);
					} else {
						var favgHum = '0.0', maxHumValue = '0.0', minHumValue = '0.0';
						var maxHumDate = dateTimeFormat(nullDate);
						var minHumDate = dateTimeFormat(nullDate);
						var rangeHumDateMin = dateTimeFormat(nullDate);
						var rangeHumDateMax = dateTimeFormat(nullDate);
					}

					//Som
					if(arrSound.length > 0) {
						//Outliers
						var filteredSoundArray = filterOutliers(arrSound);
						//Soma...
						var fsumSound = 0.0;
						for (var i=filteredSoundArray.length-1; i>=0; i--) {
							fsumSound = fsumSound + parseFloat(filteredSoundArray[i].value);
						}
						//.. para cálculo da média
						var favgSound = (fsumSound / filteredSoundArray.length).toFixed(2);
						//encontrar o máx..
						var fmaxSound = (arrayMax(filteredSoundArray));
						var maxSoundValue = parseFloat((fmaxSound.value)).toFixed(2);
						var maxSoundDate = dateTimeFormat(fmaxSound.dateOfReading);
						//e o min..
						var fminSound = (arrayMin(filteredSoundArray));
						var minSoundValue = parseFloat((fminSound.value)).toFixed(2);
						var minSoundDate = dateTimeFormat(fminSound.dateOfReading);
						//e o range de datas de leitura - duvida se ponho o array filtrado ou ainda o original...
						var rangeSoundDateMin = dateRangeMin(filteredSoundArray);
						var rangeSoundDateMax = dateRangeMax(filteredSoundArray);
					} else {
						var favgSound = '0.0', maxSoundValue = '0.0', minSoundValue = '0.0';
						var maxSoundDate = dateTimeFormat(nullDate);
						var minSoundDate = dateTimeFormat(nullDate);
						var rangeSoundDateMin = dateTimeFormat(nullDate);
						var rangeSoundDateMax = dateTimeFormat(nullDate);
					}

					//Luminosidade
					if(arrLumi.length > 0) {
						//Outliers
						var filteredLumiArray = filterOutliers(arrLumi);
						//Soma...
						var fsumLumi = 0.0;
						for (var i=filteredLumiArray.length-1; i>=0; i--) {
							fsumLumi = fsumLumi + parseFloat(filteredLumiArray[i].value);
						}
						//.. para cálculo da média
						var favgLumi = (fsumLumi / filteredLumiArray.length).toFixed(2);
						//encontrar o máx..
						var fmaxLumi = (arrayMax(filteredLumiArray));
						var maxLumiValue = parseFloat((fmaxLumi.value)).toFixed(2);
						var maxLumiDate = dateTimeFormat(fmaxLumi.dateOfReading);
						//e o min..
						var fminLumi = (arrayMin(filteredLumiArray));
						var minLumiValue = parseFloat((fminLumi.value)).toFixed(2);
						var minLumiDate = dateTimeFormat(fminLumi.dateOfReading);
						//e o range de datas de leitura - duvida se ponho o array filtrado ou ainda o original...
						var rangeLumiDateMin = dateRangeMin(filteredLumiArray);
						var rangeLumiDateMax = dateRangeMax(filteredLumiArray);
					} else {
						var favgLumi = '0.0', maxLumiValue = '0.0', minLumiValue = '0.0';
						var maxLumiDate = dateTimeFormat(nullDate);
						var minLumiDate = dateTimeFormat(nullDate);
						var rangeLumiDateMin = dateTimeFormat(nullDate);
						var rangeLumiDateMax = dateTimeFormat(nullDate);
					}

					//Objecto para colocar na nova tabela da BD
					var myEntry = {nodeId: values, avgTemp: favgTemp, avgHum: favgHum, avgSound: favgSound, avgLumi: favgLumi,

						maxTemp: maxTempValue, dateOfMaxTemp: maxTempDate, minTemp: minTempValue, dateOfMinTemp: minTempDate, 
						temperatureEarlistReadingDate: rangeTempDateMin, temperatureOldestReadingDate: rangeTempDateMax,

						maxHum: maxHumValue, dateOfMaxHum: maxHumDate, minHum: minHumValue, dateOfMinHum: minHumDate, 
						humidityEarlistReadingDate: rangeHumDateMin, humidityOldestReadingDate: rangeHumDateMax,

						maxSound: maxSoundValue, dateOfMaxSound: maxSoundDate, minSound: minSoundValue, dateOfMinSound: minSoundDate, 
						SoundidityEarlistReadingDate: rangeSoundDateMin, SoundidityOldestReadingDate: rangeSoundDateMax,

						maxLumi: maxLumiValue, dateOfMaxLumi: maxLumiDate, minLumi: minLumiValue, dateOfMinLumi: minLumiDate, 
						LumiidityEarlistReadingDate: rangeLumiDateMin, LumiidityOldestReadingDate: rangeLumiDateMax,

						dateOfEntry: dateTime};
					console.log(myEntry);
					
					/*
					//inserir o registo na nova collection readingsFusedData
					var MongoClientFinal = require('mongodb').MongoClient
						, assert = require('assert');
					MongoClient.connect(url, function(err, db) {
						assert.equal(null, err);
						if (err) throw err;
						var collectionFinal = db.collection('readingsFusedData');
						collectionFinal.insertOne(myEntry, function(err, res) {
							if (err) throw err;
							console.log("1 record inserted for node : " + values);
							db.close();
						});
					});
					*/
		    });
		  }))
			/*
			//limpa a collection readings - DADOS RAW
			collection.remove({}, function(err) {
				if(err) console.log(err);*/
				db.close();
			//});
		});
	});
}, the_interval);

//Filtrar o array recebido e retornar sem outliers
function filterOutliers(someArray) {  

  // Copy the values, rather than operating on references to existing values
  var values = someArray;
	
  // Then sort
  values.sort( function(a, b) {
    return a.value - b.value;
	});

  /* Then find a generous IQR. This is generous because if (values.length / 4) 
   * is not an int, then really you should average the two elements on either 
   * side to find q1.
   */
	var q1 = values[Math.floor((values.length / 4))];
  // Likewise for q3. 
  var q3 = values[Math.ceil((values.length * (3 / 4)))];
  var iqr = q3.value - q1.value;

  // Then find min and max values - mild outliers are those data points which lay between 1.5 * IRQ and 3 * IRQ
  var maxValue = q3.value + iqr * 1.5;
  var minValue = q1.value - iqr * 1.5;

  // Then filter anything beyond or beneath these values.
  var filteredValues = [];
	for (var i=values.length-1; i>=0; i--) {
		tmp = values[i].value;
		if ((tmp <= maxValue) && (tmp >= minValue)) {
			filteredValues.push(values[i]);
		}
	}

  // Then return the filtered object array
  return filteredValues;
};

//retorna o registo com o valor minimo do array
function arrayMin(arr) {
  var len = arr.length, min = Infinity;
	var min = arr[len-1];
	for (var i=len-1; i>=0; i--) {
		tmp = arr[i].value;
		if (tmp < min.value) {
			min = arr[i];
		}
	}
  return min;
};

//retorna o registo com o valor maximo do array
function arrayMax(arr) {
  var len = arr.length, max = -Infinity, tmp;
	var max = arr[len-1];
	for (var i=len-1; i>=0; i--) {
		tmp = arr[i].value;
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
