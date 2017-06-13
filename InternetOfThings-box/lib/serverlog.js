var fs = require("fs"),
    cp = require('child_process'),
    logfile = './serverlog.log';


module.exports = {
    clearLogFile: function() {
        fs.closeSync(fs.openSync(logfile, 'w'));

        // try {
        //     cp.execSync('echo " " > ' + logfile);
        //     this.appendToLog("Clear...");
        // } catch (e) {
        //     fs.writeFileSync(logfile, "Clear...", 'utf8');
        // }
    },

    appendToLog: function(text) {
        fs.appendFileSync(logfile, new Date().toString() + "\t" + text + "\n");
    }
}
