/* global module */

require('colors');
var cp = require('child_process');
var fs = require('fs');
var ini = require('ini');
var request = require("request");


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
    var fini = "; isto e um comentario\n[global]" +
            "\nconfig = true" +
            "\nfilemonitor = " + req.body.data.filemonitor +
            "\nautostart = " + req.body.data.autostart +
            "\nsshaccess = " + req.body.data.sshport +
            "\n\n; definicao da base de dados\n[database]" +
            "\nsitename= " + req.body.data.sitename +
            "\nhost = " + req.body.data.host +
            "\nport = " + req.body.data.port +
            "\nprojectname = " + req.body.data.password +
            "\n\n; local do sensor\n[localsensor]" +
            "\ncheckposition = false" +
            "\nmorada = " + req.body.data.morada +
            "\nnomeSensor = " + req.body.data.nomeSensor +
            "\nlatitude = " + req.body.data.latitude +
            "\nlongitude = " + req.body.data.longitude +
            "\nposx = " + req.body.data.posx +
            "\nposy = " + req.body.data.posy +
            "\nplant = " + req.body.data.plant;

    fs.writeFile("./ConfigSKT.ini", fini, function (err) {
        if (err) {
            res.json(err);
        }
        res.json("save");
    });
};

module.exports.getLastGitUpdate = function (req, res) {
    cp.exec("git log -1 --format=%cd", function (error, stdout, stderr) {
        res.json(stdout);
    });
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