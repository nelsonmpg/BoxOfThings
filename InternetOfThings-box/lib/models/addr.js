var mongoose = require('mongoose'),
    fs = require('fs'),
    Schema = mongoose.Schema;

var addrSchema = Schema({
    address: { type: String },
    firstLetter: { type: String },
    secondLetter: { type: String }
});

var Addr = function() {
    this.addrDB = mongoose.model('Addr', addrSchema);
};

Addr.prototype.removeAllRecords = function() {
    this.addrDB.remove({}, function(err, result) {
        if (err) {
            console.log("Erro ao tentar apagar todos os registos.\n" + err);
        } else {
            console.log("Foram apagados todos os registos 'Addr'. - " + result);
        }
    });
};

Addr.prototype.insertData = function(data) {
    var self = this;
    // Recebendo os parâmetros da requisição
    // create a new user
    var newAddrData = self.addrDB(data);

    // save the user
    newAddrData.save(function(err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('Addr value insert!');
    });
};

Addr.prototype.getAllData = function(callback) {
    var self = this;
    this.addrDB.find({}, function(err, addrs) {
        if (err) {
            console.log(err);
        } else {
	    //console.log("Passo 1:",addrs);
	    callback(addrs);
	}
    });
};

module.exports = Addr;
