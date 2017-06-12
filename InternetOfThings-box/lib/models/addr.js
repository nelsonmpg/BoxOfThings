var mongoose = require('mongoose'),
    fs = require('fs'),
    log = require('./../serverlog.js'),
    Schema = mongoose.Schema;

var addrSchema = Schema({
    address: { type: String },
    firstLetter: { type: String },
    secondLetter: { type: String }
});

var Addr = function() {
    this.addrDB = mongoose.model('Addr', addrSchema);
};

Addr.prototype.insertData = function(data) {
    var self = this;
    // Recebendo os parâmetros da requisição
    // create a new user
    var newAddrData = self.addrDB(data);

    // save the user
    newAddrData.save(function(err) {
        if (err) {
            log.appendToLog(err);
            console.log(err);
            return;
        }
        log.appendToLog('Addr value insert.');
        console.log('Addr value insert!');
    });
};

module.exports = Addr;