require('colors');
var mongoose = require('mongoose'),
    log = require('./../serverlog.js'),
    connStr;

module.exports.connectDB = function(config) {
    // connect to mongo db
    mongoose.Promise = global.Promise;
    connStr = config.dataBaseType + '://' + config.host + '/' + config.dbname;
    mongoose.connect(connStr, function(err) {
        if (err) {
            throw err;
        }
        log.appendToLog("Successfully connected to MongoDB");
        console.log("Successfully connected to MongoDB".italic.magenta);
        // return mongoose.connection;
    });
};
