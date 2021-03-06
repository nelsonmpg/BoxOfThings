var mongoose = require('mongoose'),
    fs = require('fs'),
    Schema = mongoose.Schema;


var routeSchema = Schema({
    address: { type: String, unique: true },
    from: { type: String },
    time: { type: String }
});

var Route = function() {
    this.routeDB = mongoose.model('Route', routeSchema);
};

Route.prototype.removeAllRecords = function() {
    this.routeDB.remove({}, function(err, result) {
        if (err) {
            console.log("Erro ao tentar apagar todos os registos.\n" + err);
        } else {
            console.log("Foram apagados todos os registos 'Route'. - " + result);
        }
    });
};

Route.prototype.getAllAdressDistinct = function(res) {
    this.routeDB.distinct("address", function(err, result) {
        if (err) {
            console.log("Erro ao tentar ler todos as Routes.\n" + err);
        } else {
            if (typeof res === "function") {
                res(result);
            } else {
                res.json({
                    status: "Routes OK",
                    stdout: result
                });
            }
        }
    });
};

Route.prototype.insertData = function(data) {
    var self = this;
    // Recebendo os parâmetros da requisição
    // create a new user
    var newRouteData = self.routeDB(data);

    // save the user
    newRouteData.save(function(err) {
        if (err) {
            console.log(err);
            return;
        }
        console.log('Route value insert!');
    });
};

module.exports = Route;
