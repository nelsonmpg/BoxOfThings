/* global module */

require('colors');
var net = require('net'),
    cp = require('child_process'),
    fs = require('fs'),
    ini = require('ini'),
    request = require("request"),
    SSH = require('simple-ssh'),
    macaddress = require('macaddress'),
    fileconfig = './MainConfig.ini',
    sshfileconfig = './configssh.json',
    dbToModels = require('./dbToModel.js'),
    configSSH = null,
    coapSensor;

module.exports.getHtmlText = function(req, res) {
    var self = this;
    dbToModels.removeOldRecords();
    cp.exec("cat /var/log/6lbr.ip", function(error, stdout, stderr) {
        if (error) {
            console.log("Erro ao tentar ler o ficheiro /var/log/6lbr.ip.".red);
            return;
        }
        request("http://[" + stdout.replace(/\n|\t/g, "") + "]/" + req.params.page, function(error, response, body) {
            if (!error) {
                if (res) {
                    res.json(response);
                } else {
                    dbToModels.parseHtml(body);
                    setTimeout(function() {
                        console.log("New call html page.");
                        module.exports.getHtmlText({ params: { page: 'network.html' } }, null);
                    }, 10 * 1000);
                }
            } else {
                console.log("Error -> ", error);
                console.log("Restart 6lbr");
                cp.exec("sudo route -A inet6 add aaaa::/64 gw bbbb::100", function(error, stdout, stderr) {
                    if (error) {
                        console.log("Erro ao tentar adicionar a rota.");
                    } else {
                        console.log("A rota foi adicionada com sucesso.");
                        cp.exec("sudo service 6lbr restart", function(error, stdout, stderr) {
                            if (error) {
                                console.log("Erro ao tentar reiniciar o serviço 6lbr.".red);
                                return;
                            }
                            console.log("A reiniciar o serviço 6lbr.".green);
                            if (!res) {
                                setTimeout(function() {
                                    self.getHtmlText({ params: { page: 'network.html' } }, null);
                                }, 1 * 60 * 1000);
                            }
                        });
                    }
                });
            }
        });

    });

};

/**
 * Devolve as configuracoes do ficheiro Ini
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.getinifileparams = function(req, res) {
    if (fs.existsSync(sshfileconfig)) {
        var contents = fs.readFileSync(sshfileconfig).toString();
        if (IsJsonString(contents)) {
            res.send({
                status: "File Ok",
                stdout: JSON.parse(contents)
            });
        } else {
            res.status(500).send({
                status: "Fail",
                stdout: "Não é um ficheiro no formato correto."
            });
        }
    } else {
        res.status(500).send({
            status: "Fail",
            stdout: "O ficheiro não existe."
        });
    }
};

module.exports.defaultparamsinifile = function(req, res) {
    var t1 = cp.execSync('cat /proc/cpuinfo | grep Serial | cut -d" " -f2');
    var t2 = cp.execSync('cat /proc/meminfo | grep Total | tr -s " " " " | cut -d":" -f2 | cut -d" " -f2 | awk \'{ x += $1 } ; END { print x}\'');
    var homedir = cp.execSync('echo $HOME');

    macaddress.one(function(err, mac) {
        var macaddress = mac;

        var objJson = {
            boxparams: {
                name: "BoxIoT",
                mac: macaddress,
                model: "1.0",
                version: "1.0",
                type: "1.0",
                Serial: (Math.pow(t1.toString("utf8").replace(/[+|e]/g, "") * 1, 2) + t2.toString("utf8").replace(/[+|e]/g, "") * 1),
                manuf: "PT-PT",
                coordN: "0.0",
                coordW: "0.0",
                clientname: "",
                address: "",
                code: "",
                city: "",
                phone: "",
                yearinstall: ""
            },
            localip: "127.0.0.1",
            localport: "3000",
            remoteport: "1000",
            remoteuser: "root",
            remoteip: "127.0.0.1",
            sshport: "22",
            privatersa: homedir.toString("utf8").replace('\n', '') + "/.ssh/id_rsa",
            remotepathscript: homedir.toString("utf8").replace('\n', '') + "/freeport.js"
        };
        res.send({
            status: "File Ok",
            stdout: objJson
        });

    });
};

/**
 * Guarda as configuracoess no ficheiro Ini
 * @param {type} req
 * @param {type} res
 * @returns {undefined}
 */
module.exports.savesettings = function(req, res) {
    var self = this;
    var json = JSON.stringify(req.body.data);
    fs.writeFile(sshfileconfig, json, 'utf8', function(err) {
        if (err) {
            res.status(500).send({
                status: "erro ao gravar as configurações SSH.",
                stdout: err
            });
        } else {
            var configexist = checkconfigexist(fileconfig);
            var datavals = [];
            if (configexist) {
                var config = ini.parse(fs.readFileSync(fileconfig, 'utf-8'));
                datavals = {
                    portlocalserver: config.global.portlocalserver,
                    configok: config.global.configok,
                    dataBaseType: config.database.dataBaseType,
                    dataBasehost: config.database.host,
                    databasedbname: config.database.dbname,
                    databaseuser: config.userportal.user,
                    databasepass: config.userportal.pass
                };
                var saveini = "" +
                    "; Config Global\n" +
                    "[global]\n" +
                    "portlocalserver = " + datavals.portlocalserver + "\n" +
                    "configok = true\n\n" +
                    "; definicao da base de dados\n" +
                    "[database]\n" +
                    "dataBaseType = " + datavals.dataBaseType + "\n" +
                    "host = " + datavals.dataBasehost + "\n" +
                    "dbname = " + datavals.databasedbname + "\n\n" +
                    "; Utilizador por defeito de acesso ao portal\n" +
                    "[userportal]\n" +
                    "user = " + datavals.databaseuser + "\n" +
                    "pass = " + datavals.databasepass + "\n";

                fs.writeFile(fileconfig, saveini, 'utf8', function(err) {
                    if (err) {
                        console.log("Erro ao tentar gravar o ficheiro global de configuracao.".red.bold);
                    } else {
                        console.log("O ficheiro de configuração global foi atualizado.".green.bold);
                    }
                });
                res.send({
                    status: "ok",
                    stdout: "successs"
                });
            } else {
                res.send({
                    status: "ok",
                    stdout: "Erro ao atualizar o ficheiro MainConfig."
                });
                Console.log("Erro ao ler o ficherio de configuracao global.".red.bold);
            }
        }
    });
};

module.exports.getLastGitUpdate = function(req, res) {
    cp.exec("git log -1 --format=%cd", function(error, stdout, stderr) {
        res.json(stdout);
    });
};

module.exports.createconnetionSSH = function(coap) {
    var self = this;
    coapSensor = coap;
    try {
        cp.execSync("sh ./removeAllSSHTunnels.sh");

    } catch (e) {
        console.log("Script não executado.");
    }

    if (fs.existsSync(sshfileconfig)) {

        var contents = fs.readFileSync(sshfileconfig).toString();
        if (IsJsonString(contents)) {
            configSSH = JSON.parse(contents);

            if (fs.existsSync(configSSH.privatersa.toString("utf8"))) {
                var ssh = new SSH({
                    host: configSSH.remoteip,
                    user: configSSH.remoteuser,
                    port: configSSH.sshport,
                    key: fs.readFileSync(configSSH.privatersa.toString("utf8"))
                });
                var strBox = JSON.stringify(configSSH.boxparams);
                strBox = strBox.replace(/","/g, '" --').replace(/":"/g, ' "').replace(/{"/, "--").replace(/}/g, "");
                ssh.exec('node ' + configSSH.remotepathscript + ' ' + configSSH.remoteport + ' ' + strBox, {
                    err: function(stderr) {
                        console.log("A execução do script remoto não foi executada.".red.bold);
                        console.log(stderr);
                    },
                    out: function(code) {
                        if (IsJsonString(code)) {
                            var resultSsh = JSON.parse(code);
                            if (resultSsh.port != "" && resultSsh.port != undefined && resultSsh.port != "undefined" && resultSsh.port != null) {
                                if (configSSH.remoteport != resultSsh.port) {
                                    configSSH.remoteport = resultSsh.port;
                                    fs.writeFile('configssh.json', JSON.stringify(configSSH), 'utf8', function(err) {
                                        if (err) {
                                            console.log("Erro ao tentar gravar o ficheiro.".red.bold);
                                        } else {
                                            console.log("O ficheiro de configuração do SSH foi atualizado.".green.bold);
                                        }
                                    });
                                }
                            } else {
                                console.log("Erro ao tentar ler os dados rcebidos do cliente remoto.".red.bold);
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
                console.log("O caminho para a chave privada da box não existe.".red.bold);
            }
        } else {
            console.log("É necessário efetuar as configurações SSH para a comunicação remota.".red.bold);
        }
    } else {
        console.log("É necessário efetuar as configurações SSH para a comunicação remota.".red.bold);
    }
};

module.exports.createReverseTunnel = function() {
    var self = this;
    // inicia o tunel ssh com a cloud
    cp.exec("sh ./runTunneling.sh " + configSSH.remoteport + " " + configSSH.localip + " " + configSSH.localport + " " + configSSH.remoteuser + " '" + configSSH.remoteip + "' " + configSSH.sshport, function(error, stdout, stderr) {
        if (error instanceof Error) {
            console.log('exec error: ' + error);
            console.log("Erro na criação do tunel SHH port : %s:%s".red.bold, configSSH.remoteip, configSSH.remoteport);
            return;
        }
        console.log('stdout ', stdout);
        console.log('stderr ', stderr);
        console.log("tunnel ssh created!!!".green.bold);
    });
};

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

var IsJsonString = function(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
};
