var fs = require("fs"),
    logfile = 'serverlog.log';


module.exports = {
    appendToLog : function(text) {
        fs.appendFileSync(logfile, new Date().toString() + "\t" + text + "\n");
    },

}
