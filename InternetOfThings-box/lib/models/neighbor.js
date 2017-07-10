var mongoose = require('mongoose'),
    fs = require('fs'),
    Schema = mongoose.Schema;

var neighborSchema = Schema({
    address: { type: String },
    from: { type: String },
    status: { type: String }
});

var Neighbor = function() {
    this.neighborDB = mongoose.model('Neighbor', neighborSchema);
};

Neighbor.prototype.removeAllRecords = function() {
    this.neighborDB.remove({}, function(err, result) {
        if (err) {
            console.log("Erro ao tentar apagar todos os registos.\n" + err);
        } else {
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
            console.log(err);
            return;
        }
        console.log('Neighbor value insert!');
    });
};

module.exports = Neighbor;
