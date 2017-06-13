var fs = require("fs"),
    cp = require('child_process'),
    logfile = 'serverlog.log';


module.exports = {
    clearLogFile: function() {
        var newfile = cp.spawn('echo', [' ', '>', logfile]);
        newfile.on('exit', function(code) {
            console.log('child process exited with code ' + code.toString());
            fs.unlinkSync(logfile);
        });
    },

    appendToLog: function(text) {
        fs.appendFileSync(logfile, new Date().toString() + "\t" + text + "\n");
    }
}
