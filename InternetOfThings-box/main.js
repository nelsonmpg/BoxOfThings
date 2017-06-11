/* global module */

require('colors');
var cp = require('child_process'),
    fs = require('fs'),
    ini = require('ini')
mainCfg = "./MainConfig.ini";

/**
 * 
 * @returns {undefined}
 */
var Main = function() {
    var args;
    // Verifica se o ficheiro de ligacao com a base de dados para iniciar a comunicacao
    if (this.checkconfigexist(mainCfg)) {
        this.config2 = ini.parse(fs.readFileSync(mainCfg, 'utf-8'));
        // carrega as configuracoes do ficheiro ini para as variaveis

        try {

            args = {
                portlocalserver: this.config2.global.portlocalserver,
                pathserverfreeport: this.config2.global.pathserverfreeport,
                configok: this.config2.global.configok,
                dataBaseType: this.config2.database.dataBaseType,
                host: this.config2.database.host,
                dbname: this.config2.database.dbname,
                user: this.config2.userportal.user,
                pass: this.config2.userportal.pass
            };

            // inicia p script e envia as configuracores do ficheiro ini
            var child2 = cp.fork('./lib/serverHTTP');
            child2.send({ "serverdata": args });
            return;
        } catch (e) {
            console.log("MainConfig invalido ! ! !".red);
            creteMainConfig(mainCfg);
        }
    } else {
        console.log("MainConfig not exist ! ! !".red);
        creteMainConfig(mainCfg);
    }
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
        console.log("Tentar recriar o ficheiro global de configuração volte a tentar novamente!");
        if (err) {
            console.log("Erro ao tentar gravar o ficheiro default global de configuracao.".red.bold);
        } else {
            console.log("O ficheiro de configuração default global foi criado con sucesso.".green.bold);
        }
    });
}
