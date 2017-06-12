var fs = require("fs"),
    logfile = 'serverlog.log';


module.exports = {
    clearLogFile: function() {
        fs.unlinkSync(logfile);
    },

    appendToLog: function(text) {
        fs.appendFileSync(logfile, new Date().toString() + "\t" + text + "\n");
    }
}
