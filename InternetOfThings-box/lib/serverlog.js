var fs = require("fs"),
    cp = require('child_process'),
    logfile = 'serverlog.log';


module.exports = {
    clearLogFile: function() {
        cp.execSync('echo " " > ' + logfile);
        this.appendToLog("Clear...");
    },

    appendToLog: function(text) {
        fs.appendFileSync(logfile, new Date().toString() + "\t" + text + "\n");
    }
}
