var fs = require("fs"),
    cp = require('child_process'),
    logfile = './serverlog.log';


module.exports = {
    clearLogFile: function() {
        try {
            fs.closeSync(fs.openSync(logfile, 'w'));
        } catch (e) {
            console.log("Erro ao criar o ficheiro log " + e.toString());
        }
    },

    appendToLog: function(text) {
        fs.appendFileSync(logfile, new Date().toString() + "\t" + text + "\n");
    }
}
