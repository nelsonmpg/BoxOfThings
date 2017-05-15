/* global module, __dirname, process */

require('colors'); //bold, italic, underline, inverse, yellow, cyan, white, magenta, green, red, grey, blue, rainbow
var express = require('express');
var http = require('http');
var fs = require('fs');
var socketio = require('socket.io');
var serverIo = require('./serverio');
var bodyParser = require('body-parser');
//var r = require('rethinkdb');
var cp = require('child_process');
var ini = require('ini');
var dbUsers = require('./db.js');
var osquerys = require("./linuxquery");

/**
 * Construtor do servidor HTTP
 * @param {type} configdb Consiguracao da base de dados
 * @returns {ServerHTTP}
 */
var ServerHTTP = function (configdb) {
  this.app = express();
  this.server = http.Server(this.app);
  this.io = socketio(this.server);
  this.port = 8080;
  this.dbConfig = configdb;
  // variavel de comunicacao com a base de dados
  this.dbData = {
    host: this.dbConfig.host,
    port: this.dbConfig.port,
    authKey: this.dbConfig.authKey
  };
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

// Envia as configuracoes da base de dados para o script de acesso aos dados dos useres
  dbUsers.dbData = this.dbData;

// Login do utilizador
  this.app.post("/login", dbUsers.loginUser);

  // this.app.post("/insertUsr", dbUsers.insertUser);

// devolve a lista de sites existentes no servidor do login
  //this.app.get("/getsitelist", dbUsers.getsitelist);

  // verifica se o caminho para uma diretoria existe
  this.app.get("/validpathsystem/:path", osquerys.validpathsystem);

// Consulta o SO para listar as interfaces wlan
  this.app.get("/dispOswlan", osquerys.getdispwlan);

// Consulta o SO para saber se existe a interface monitor criada
  this.app.get("/dispOsmon", osquerys.getdispmon);

// Devolve as configuracoes do ficheiro Ini
  this.app.get("/paramsinifile", osquerys.getinifileparams);

// Guarda as configuracoess no ficheiro Ini
  this.app.post("/savesettings", osquerys.savesettings);

// Constroi a interface monitor
  this.app.post("/createmonitor", osquerys.createmonitor);

// Inicia a interface monitor
  this.app.post("/startmonitor", osquerys.startmonitor);

// Para a interface monitor
  this.app.post("/stopmonitor", osquerys.stoptmonitor);

// Consulta o SO para saber se a interface monitor se encontra em funcionamento
  this.app.get("/checkmonitorstart", osquerys.checkmonitorstart);

// Reinicia o SO
  this.app.get("/restartsystem", osquerys.restartsystem);

// Desliga o SO
  this.app.get("/poweroffsystem", osquerys.poweroffsystem);

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