require('colors');
var mongoose = require('mongoose'),
    connStr;

module.exports.connectDB = function(config) {
    // connect to mongo db
    mongoose.Promise = global.Promise;
    connStr = config.dataBaseType + '://' + config.host + '/' + config.dbname;
    mongoose.connect(connStr, function(err) {
        if (err) {
            throw err;
        }
        console.log("Successfully connected to MongoDB".italic.magenta);
        // return mongoose.connection;
    });
};
