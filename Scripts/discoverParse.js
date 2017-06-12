function getMoteMethods(ipDoMote,data){
	//Trocar isto pela chamada da função getdatalalalalas
	//ou seja, chamar a função e enviar para aqui por param (data) os dados desencriptados
	var data = '</.well-known/core>;ct=40,</test/ola>;title="Olá Mundo1: ?len=0..";rt="Text",</test/hello>;title="Hello world: ?len=0..";rt="Text",</actuators/leds>;title="LEDs: ?color=r|g|b, POST/PUT mode=on|off";rt="Control",</actuators/toggle>;title="Red LED";rt="Control",</sensors/button>;title="Event demo";obs,</test/separate>;title="Separate demo",</test/push>;title="Periodic demo";obs,</test/sub>;title="Sub-resource demo",</sensors/sht25>;title="Temperature and Humidity";rt="SHT25",</sensors/zoul>;title="Zoul on-board sensors";rt="zoul"',
	//Para chamar a função usar isto:
	//GET
	//FOLDER: .well-known
	//RESOURCE: core


	resSplit = data.split(','),
	values = [];
	for(var i = 0; i<resSplit.length;i++){
		if(resSplit[i].startsWith("<")){
			var lastIndex = resSplit[i].lastIndexOf('>');
			values.push(resSplit[i].substr(1,lastIndex));
		}	
	}

	var objectToInsert = {id:ipDoMote},
	dataArray = [];

	for(var i = 0; i < values.length;i++){
		var lineVals = values[i].split('/'),
		obj = {folder:lineVals[1],resource:lineVals[2]};
		dataArray.push(obj);
	}
	objectToInsert.data=dataArray;
	return objectToInsert;
}
