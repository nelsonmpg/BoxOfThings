/* global module, __dirname, process */

require('colors'); //bold, italic, underline, inverse, yellow, cyan, white, magenta, green, red, grey, blue, rainbow
var express = require('express'),
    http = require('http'),
    fs = require('fs'),
    socketio = require('socket.io'),
    bodyParser = require('body-parser'),
    cp = require('child_process'),
    ini = require('ini'),
    serverIo = require('./serverio'),
    osquerys = require("./linuxquery"),
    coapCalls = require('./coapCalls.js'),
    dataFusion = require('./dataFusion.js'),
    ServerUdp = require('./serverUDP.js'),
    dbToModels;

var ServerHTTP = function(config) {        
    ServerUdp = new ServerUdp();    
    var self = this;
    this.app = express();
    this.server = http.Server(this.app);
    this.io = socketio(this.server);
    this.configSrv = config;
    this.port = this.configSrv.portlocalserver;
    this.configok = this.configSrv.configok;
    this.configDB = {
        dataBaseType: this.configSrv.dataBaseType,
        host: this.configSrv.host,
        user: this.configSrv.user,
        pass: this.configSrv.pass,
        dbname: this.configSrv.dbname
    };

    dbToModels = require('./dbToModel.js');
    // Carrega para o script as configuraacoes da base de dados
    dbToModels.configDB(this.configDB);

    if (self.configok) {
        osquerys.createconnetionSSH(coapCalls);
    } else {
        console.log("É necessário efetuar as configurações SSH para a comunicação remota.".red.bold);
    }
    cp.exec("sudo route -A inet6 add aaaa::/64 gw bbbb::100", function(error, stdout, stderr) {
        if (error) {
            console.log("Erro ao tentar adicionar a rota.");
        } else {
            console.log("A rota foi adicionada com sucesso.")
        }
    });
};

/**
 * Inicia o servodor
 * @returns {undefined}
 */
 ServerHTTP.prototype.start = function() {
    var self = this;
    self.server.listen(self.port);
    this.skt = new serverIo({ server: self }).init();

    var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date');
        next();
    };

    // Configura o servidor
    this.app.use(bodyParser.json({ limit: '10mb' }));
    this.app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
    this.app.use(allowCrossDomain);

    // fornece ao cliente a pagina index.html
    this.app.use(express.static(__dirname + './../public'));

    // Login do utilizador
    this.app.post("/login", dbToModels.loginUser);

    this.app.post("/insertUsr", dbToModels.insertUser);

    this.app.get('/api/singleMoteAllInfo/:moteIp', coapCalls.single_mote_all_info);

    this.app.get('/api/singleMoteSingleInfo/:moteIp/:resource', coapCalls.single_mote_single_info);

    this.app.get('/api/moteAction/:moteIp/:resource/:color/:mode', coapCalls.mote_action);

    this.app.get("/api/sensor/getDataSensor/:moteIp/:folder/:resource/:params/:payload/:mMethod/:mObserve", coapCalls.getdataFromSensor);

    this.app.get('/routes/alladdress', dbToModels.getAllSensorsActive);

    this.app.get("/api/mote/:mote", dbToModels.getmoteMethods);

    // Devolve as configuracoes do ficheiro Ini
    this.app.get("/paramsinifile", osquerys.getinifileparams);

    this.app.get("/defaultparamsinifile", osquerys.defaultparamsinifile);

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

    console.log('Server HTTP Wait %d'.green.bold, self.port);
    ServerUdp.start();
    try {
        dbToModels.removeOldRecords();
        osquerys.getHtmlText({ params: { page: 'network.html' } }, null);
    } catch (e) {
        console.log("Html não carregado.", e);
    }
    dataFusion.getAllSensores();
    callServerUdpRToS();
};


var callServerUdpRToS = function(){
     setTimeout(function() {
        ServerUdp.pedeDados();
        callServerUdpRToS();
    }, 5 * 60 * 1000);
};

/**
 * Monitoriza o processo e para receber as informacoes para a criacao do servidor HTTP
 * @param {type} param1
 * @param {type} param2
 */
 process.on("message", function(data) {
    var srv = new ServerHTTP(data.serverdata);
    srv.start();
});

 module.exports = ServerHTTP;

/**
 * Verifica se o ficheiro existe
 * @param {type} file
 * @returns {Boolean}
 */
 var checkconfigexist = function(file) {
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
