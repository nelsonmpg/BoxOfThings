/* global module, __dirname, process */

require('colors'); //bold, italic, underline, inverse, yellow, cyan, white, magenta, green, red, grey, blue, rainbow
var net = require('net');
var express = require('express');
var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');
var bodyParser = require('body-parser');
var cp = require('child_process');
var ini = require('ini');
var serverIo = require('./serverio');
var osquerys = require("./linuxquery");
var dbUsers;
var coapSensor;

/**
 * Construtor do servidor HTTP
 * @param {type} config Consiguracao da base de dados
 * @returns {ServerHTTP}
 */
 var ServerHTTP = function (config) {
  var self = this;
  this.app = express();
  this.server = http.Server(this.app);
  this.io = socketio(this.server);
  this.configSrv = config;
  this.port = this.configSrv.portlocalserver;
  this.configDB = {
   dataBaseType: this.configSrv.dataBaseType,
   host: this.configSrv.host,
   user: this.configSrv.user,
   pass: this.configSrv.pass,
   dbname : this.configSrv.dbname
 }; 
 this.tunnelssh = {
   localip : this.configSrv.localip,
   localport : this.configSrv.localport,
   remoteport : this.configSrv.remoteport,
   remoteuser : this.configSrv.remoteuser,
   remoteip : this.configSrv.remoteip    
 };

 dbUsers = require('./db.js');
  // Carrega para o script as configuraacoes da base de dados
  dbUsers.configDB(this.configDB);

  coapSensor = require('./coapCalls.js');
  coapSensor.configDB(this.configDB);

  self.createReverseTunnel();
};

/**
 * Inicia o servodor
 * @returns {undefined}
 */
 ServerHTTP.prototype.start = function () {
  var self = this;
  self.server.listen(self.port);
  this.skt = new serverIo({server: self}).init();

  var allowCrossDomain = function (req, res, next) {
   res.header('Access-Control-Allow-Origin', '*');
   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
   res.header('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date');
   next();
 };

// Configura o servidor
this.app.use(bodyParser.json({limit: '10mb'}));
this.app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
this.app.use(allowCrossDomain);

  // fornece ao cliente a pagina index.html
  this.app.use(express.static(__dirname + './../public'));

// Login do utilizador
this.app.post("/login", dbUsers.loginUser);

this.app.post("/insertUsr", dbUsers.insertUser);


this.app.get("/api/sensor/getDataSensor/:endereco/:folder/:resource/:params/:payload/:mMethod/:mObserve", coapSensor.getdataFromSensor);


this.app.get("/api/sensor/threadgetDataSensor/:endereco/:folder/:resource/:params/:payload/:mMethod/:mObserve", coapSensor.threadgetdataFromSensor);



// Devolve as configuracoes do ficheiro Ini
this.app.get("/paramsinifile", osquerys.getinifileparams);

// Guarda as configuracoess no ficheiro Ini
this.app.post("/savesettings", osquerys.savesettings);

// Devolde a ultima atualizacao do git
this.app.get("/getGitLastUpdate", osquerys.getLastGitUpdate);

this.app.get("/getHtmlText/:page", osquerys.getHtmlText);

console.log("                       .__                          ".green.bold);
console.log("                       [__)                         ".green.bold);
console.log("                       [__)                         ".green.bold);
console.log("._.    ,              ,   .__.._  .___..            ".green.bold);
console.log(" | ._ -+- _ ._.._  _ -+-  |  ||,    |  |_ *._  _  __".green.bold);
console.log("_|_[ ) | (/,[  [ )(/, |   |__||     |  [ )|[ )(_]_) ".green.bold);
console.log("                              \\./             ._|  ".green.bold);
console.log("                              /'\\                  ".green.bold);

console.log('\nServer HTTP Wait %d'.green.bold, self.port);


get_line('./createTunnel.log', 0, function(err, line){
  console.log('The line: ' + line);
})
net.createServer(coapSensor.serverListening).listen(self.tunnelssh.localport, self.tunnelssh.localip);
console.log('Server listening Tunnel SSH on local %s:%s and remote %s:%s'.blue.bold, self.tunnelssh.localip, self.tunnelssh.localport, self.tunnelssh.remoteip, self.tunnelssh.remoteport);
};

ServerHTTP.prototype.createReverseTunnel = function(){  
  var self = this;

  // inicia o tunel ssh com a cloud
  cp.exec("sh ./runTunneling.sh " + self.tunnelssh.remoteport + " " +  self.tunnelssh.localip + " " + self.tunnelssh.localport + " " + self.tunnelssh.remoteuser + " '" + self.tunnelssh.remoteip + "'", function (error, stdout, stderr) {
    if (error instanceof Error) {
      console.log('exec error: ' + error);
      console.log("Erro na criação do tunel SHH port : %s:%s".red.bold, self.tunnelssh.remoteip, self.tunnelssh.remoteport);
      return;
    }
    console.log('stdout ', stdout);
    console.log('stderr ', stderr);
    console.log("tunnel ssh created!!!".green.bold);
  });
};

/**
 * Monitoriza o processo e para receber as informacoes para a criacao do servidor HTTP
 * @param {type} param1
 * @param {type} param2
 */
 process.on("message", function (data) {
  var srv = new ServerHTTP(data.serverdata);
  srv.start();
});

 module.exports = ServerHTTP;

/**
 * Verifica se o ficheiro existe
 * @param {type} file
 * @returns {Boolean}
 */
 var checkconfigexist = function (file) {
  var config;
  try {
    // try to get the override configuration file if it exists
    fs.readFileSync(file);
    config = true;
  } catch (e) {
    // otherwise, node.js barfed and we have to clean it up
    // use the default file
    config = false;
  }
  return config;
};

function get_line(filename, line_no, callback) {
  var data = fs.readFileSync(filename, 'utf8');
  var lines = data.split("\n");

  if(+line_no > lines.length){
    throw new Error('File end reached without finding line');
  }
  callback(null, lines[+line_no]);
}