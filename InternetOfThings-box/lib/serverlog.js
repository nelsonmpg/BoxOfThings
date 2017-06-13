var fs = require("fs"),
    cp = require('child_process'),
    logfile = 'serverlog.log';


module.exports = {
    clearLogFile: function() {
        cp.execSync('echo " " > ' + logfile);
        this.appendToLog("Clear...");
        // fs.unlinkSync(logfile);
    },

    appendToLog: function(text) {
        fs.appendFileSync(logfile, new Date().toString() + "\t" + text + "\n");
    }
}
