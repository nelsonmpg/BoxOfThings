/* global module */

require('colors');
var cp = require('child_process'),
    fs = require('fs'),
    ini = require('ini'),
    mainCfg = "./MainConfig.ini",
    log = require('./lib/serverlog.js');

/**
 * 
 * @returns {undefined}
 */
var Main = function() {
    var self = this;

    log.clearLogFile();

    log.appendToLog("Server start...");
    console.log("The file clear!");

    var args;
    // Verifica se o ficheiro de ligacao com a base de dados para iniciar a comunicacao
    if (self.checkconfigexist(mainCfg)) {
        self.config2 = ini.parse(fs.readFileSync(mainCfg, 'utf-8'));
        // carrega as configuracoes do ficheiro ini para as variaveis

        try {
            args = {
                portlocalserver: self.config2.global.portlocalserver,
                pathserverfreeport: self.config2.global.pathserverfreeport,
                configok: self.config2.global.configok,
                dataBaseType: self.config2.database.dataBaseType,
                host: self.config2.database.host,
                dbname: self.config2.database.dbname,
                user: self.config2.userportal.user,
                pass: self.config2.userportal.pass
            };

            // inicia p script e envia as configuracores do ficheiro ini
            var child2 = cp.fork('./lib/serverHTTP');
            child2.send({ "serverdata": args });
            return;
        } catch (e) {
            log.appendToLog("MainConfig invalido ! ! !");
            console.log("MainConfig invalido ! ! !".red);
            creteMainConfig(mainCfg);
        }
    } else {
        log.appendToLog("MainConfig not exist ! ! !");
        console.log("MainConfig not exist ! ! !".red);
        creteMainConfig(mainCfg);
    }
};

Main.prototype.startServer = function() {

};

/**
 * Verifica se o ficheiro passdo por paramentro existe
 * @param {type} file
 * @returns {Boolean}
 */
Main.prototype.checkconfigexist = function(file) {
    var config;
    try {
        // try to get the override configuration file if it exists
        fs.readFileSync(file);
        config = true;
    } catch (e) {
        // otherwise, node.js barfed and we have to clean it up
        // use the default file
        creteMainConfig(mainCfg);
        config = true;
    }
    return config;
};

// Inicia o script Iniciaol
new Main();

module.exports = Main;


var creteMainConfig = function(file) {
    var saveini = "" +
        "; Config Global\n" +
        "[global]\n" +
        "portlocalserver = 8080\n" +
        "pathserverfreeport = ~/serverRedeSensores/freePort.js\n" +
        "configok = false\n\n" +
        "; definicao da base de dados\n" +
        "[database]\n" +
        "dataBaseType = mongodb\n" +
        "host = localhost\n" +
        "dbname = BoxIOT\n\n" +
        "; Utilizador por defeito de acesso ao portal\n" +
        "[userportal]\n" +
        "user = admin@admin.pt\n" +
        "pass = admin\n";

    fs.writeFile(file, saveini, 'utf8', function(err) {
        log.appendToLog("Tentar recriar o ficheiro global de configuração volte a tentar novamente!");
        console.log("Tentar recriar o ficheiro global de configuração volte a tentar novamente!");
        if (err) {
            log.appendToLog("Erro ao tentar gravar o ficheiro default global de configuracao.");
            console.log("Erro ao tentar gravar o ficheiro default global de configuracao.".red.bold);
        } else {
            log.appendToLog("O ficheiro de configuração default global foi criado con sucesso.");
            console.log("O ficheiro de configuração default global foi criado con sucesso.".green.bold);
        }
    });
}
