/* global module */

require('colors');
var net = require('net');
var cp = require('child_process');
var fs = require('fs');
var ini = require('ini');
var request = require("request");
var SSH = require('simple-ssh');
var configSSH = null;


module.exports.getHtmlText = function (req, res) {
    request("http://[bbbb::100]/" + req.params.page, function (error, response, body) {
        if (!error) {
            res.json(response);
        } else {
            console.log(error);
        }
    });
};

/**
 * Devolve as configuracoes do ficheiro Ini
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
 module.exports.getinifileparams = function (req, res) {
    var fileconfig = './ConfigSKT.ini';
    var configexist = checkconfigexist(fileconfig);
    var datavals = [];
    if (configexist) {
        var config = ini.parse(fs.readFileSync(fileconfig, 'utf-8'));
        datavals = {
            globalconfig: config.global.config,
            filemonitor: config.global.filemonitor,
            sshport: config.global.sshaccess,
            databasesitename: config.database.sitename,
            databasehost: config.database.host,
            databaseport: config.database.port,
            databasepass: config.database.projectname,
            autostart: config.global.autostart,
            localsensormorada: config.localsensor.morada,
            localsensornomeSensor: config.localsensor.nomeSensor,
            localsensorlatitude: config.localsensor.latitude,
            localsensorlongitude: config.localsensor.longitude,
            localsensorposx: config.localsensor.posx,
            localsensorposy: config.localsensor.posy,
            localsensorplant: config.localsensor.plant
        };
    } else {
        datavals = {"globalconfig": 0};
    }
    res.json(datavals);
};

/**
 * Guarda as configuracoess no ficheiro Ini
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
 module.exports.savesettings = function (req, res) {    
    var json = JSON.stringify(req.body.data);
    
    fs.writeFile('configssh.json', json, 'utf8',function(err){
        if (err){           
            res.send({
                status: err
            });
        } else {
            res.send({
                status:"ok"
            });
        }
    });
};

module.exports.getLastGitUpdate = function (req, res) {
    cp.exec("git log -1 --format=%cd", function (error, stdout, stderr) {
        res.json(stdout);
    });
};

module.exports.createconnetionSSH = function(){
    var self = this;

    cp.execSync("sh ./removeAllSSHTunnels.sh");

    if (fs.existsSync('configssh.json')) {

        var contents = fs.readFileSync('configssh.json').toString();

        configSSH = JSON.parse(contents);

        var ssh = new SSH({
          host: configSSH.remoteip,
          user: configSSH.remoteuser,
          port: configSSH.sshport,
          key: fs.readFileSync(configSSH.privatersa.toString("utf8"))
      });

        console.log(configSSH, ssh);
        ssh.exec('node ~/node/freePort.js ' + configSSH.remoteport + ' BoxIot-12345', {
          out: function(code) {
            if (IsJsonString(code)) {
                var resultSsh = JSON.parse(code);
                if (configSSH.remoteport != resultSsh.port) {
                    configSSH.remoteport = resultSsh.port;
                    fs.writeFile('configssh.json', json, 'utf8',function(err){
                        if (err){ 
                            console.log("Erro ao tentar gravar o ficheiro.".red.bold);
                        } else {
                            console.log("O ficheiro de configuração do SSH foi atualizado.".green.bold);
                        }
                    });
                }

                self.createReverseTunnel();

                net.createServer(coapSensor.serverListening).listen(configSSH.localport, configSSH.localip);
                console.log('Server listening Tunnel SSH on local %s:%s and remote %s:%s'.blue.bold, configSSH.localip, configSSH.localport, configSSH.remoteip, configSSH.remoteport);
                console.log("Remote access Box 'user %s port %s'.".blue.bold, configSSH.localip, configSSH.remoteport);
            } else {
                console.log("Erro ao tentar converter o ficheiro para JSON.".red.bold);
            }
        }
    }).start();
    } else {
       console.log("É necessário efetuar as configurações SSH para a comunicação remota.".red.bold);
   }
};

module.exports.createReverseTunnel = function(){ 
  var self = this;
  console.log("2345675543245676654");
  // // inicia o tunel ssh com a cloud
  // cp.exec("sh ./runTunneling.sh " + self.tunnelssh.remoteport + " " +  self.tunnelssh.localip + " " + self.tunnelssh.localport + " " + self.tunnelssh.remoteuser + " '" + self.tunnelssh.remoteip + "' " + self.tunnelssh.sshport, function (error, stdout, stderr) {
  //   if (error instanceof Error) {
  //     console.log('exec error: ' + error);
  //     console.log("Erro na criação do tunel SHH port : %s:%s".red.bold, self.tunnelssh.remoteip, self.tunnelssh.remoteport);
  //     return;
  //   }
  //   console.log('stdout ', stdout);
  //   console.log('stderr ', stderr);
  //   console.log("tunnel ssh created!!!".green.bold);
  // });
};

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

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}