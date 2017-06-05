/* global module */

require('colors');
var cp = require('child_process');
var fs = require('fs');
var ini = require('ini');

/**
 * 
 * @returns {undefined}
 */
 var Main = function () {
  var args;
  // Verifica se o ficheiro de ligacao com a base de dados para iniciar a comunicacao
  if (this.checkconfigexist('./MainConfig.ini')) {
    this.config2 = ini.parse(fs.readFileSync('./MainConfig.ini', 'utf-8'));
    // carrega as configuracoes do ficheiro ini para as variaveis
    
    try {

      args = {
        portlocalserver: this.config2.global.portlocalserver,
        configok: this.config2.global.configok,
        dataBaseType: this.config2.database.dataBaseType,
        host: this.config2.database.host,
        dbname : this.config2.database.dbname,
        user: this.config2.userportal.user,
        pass: this.config2.userportal.pass
      };

      // inicia p script e envia as configuracores do ficheiro ini
      var child2 = cp.fork('./lib/serverHTTP');
      child2.send({"serverdata" : args});
      return;
    } catch (e) {
      console.log("MainConfig invalido ! ! !".red);
    }
  } else {
    console.log("MainConfig not exist ! ! !".red);    
  }
};

/**
 * Verifica se o ficheiro passdo por paramentro existe
 * @param {type} file
 * @returns {Boolean}
 */
 Main.prototype.checkconfigexist = function (file) {
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

// Inicia o script Iniciaol
new Main();

module.exports = Main;