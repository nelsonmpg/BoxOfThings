var mongoose = require('mongoose'),
    fs = require('fs'),
    log = require('./../serverlog.js'),
    Schema = mongoose.Schema;

var neighborSchema = Schema({
    address: { type: String },
    from: { type: String },
    status: { type: String }
});

var Neighbor = function() {
    this.neighborDB = mongoose.model('Neighbor', neighborSchema);
};

Neighbor.prototype.removeAllRecprds = function() {
    this.neighborDB.remove({}, function(err, result) {
        if (err) {
            log.appendToLog("Erro ao tentar apagar todos os registos.\n" + err);
            console.log("Erro ao tentar apagar todos os registos.\n" + err);
        } else {
            log.appendToLog("Foram apagados todos os registos 'Neighbor'. - " + result);
            console.log("Foram apagados todos os registos 'Neighbor'. - " + result);
        }
    });
};

Neighbor.prototype.insertData = function(data) {
    var self = this;
    // Recebendo os parâmetros da requisição
    // create a new user
    var newNeighborData = self.neighborDB(data);

    // save the user
    newNeighborData.save(function(err) {
        if (err) {
            log.appendToLog(err);
            console.log(err);
            return;
        }
        log.appendToLog('Neighbor value insert.');
        console.log('Neighbor value insert!');
    });
};

module.exports = Neighbor;
