var os = require("os");
const drivelist = require('drivelist');
var macaddress = require('macaddress');

require("machine-uuid")(function(uuid) {
  console.log(uuid)
})


console.log(os.networkInterfaces());

os.cpus();

os.tmpDir();

os.arch();

var bytesAvailable = os.totalmem(); // returns number in bytes
// 1 mb = 1048576 bytes
console.log("Total memory available MB :" + (bytesAvailable/1048576) );


var mbTotal = ((os.totalmem())/1048576);
var mbFree = ((os.freemem())/1048576);

console.log("There are "+mbFree+"mb free in the memory of "+mbTotal+"mb in total");

drivelist.list((error, drives) => {
    if (error) {
        throw error;
    }

    drives.forEach((drive) => {
        console.log(drive);
    });
});


console.log("Host name - " + os.hostname());

console.log("Load avg - " + os.loadavg());

console.log("Os plataform - " + os.platform());

console.log("release   -" + os.release());

console.log("type -" + os.type());

console.log("User info - ");
console.log(os.userInfo());




console.log(os.userInfo().homedir);




macaddress.one(function (err, mac) {
  console.log("Mac address for this host: %s", mac);  
});

macaddress.all(function (err, all) {
  console.log(JSON.stringify(all, null, 2));
});

console.log(JSON.stringify(macaddress.networkInterfaces(), null, 2));


