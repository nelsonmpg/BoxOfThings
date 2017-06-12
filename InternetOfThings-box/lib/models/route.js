var mongoose = require('mongoose'),
    fs = require('fs'),
    log = require('./../serverlog.js'),
    Schema = mongoose.Schema;


var routeSchema = Schema({
    address: { type: String },
    from: { type: String },
    time: { type: String }
});

var Route = function() {
    this.routeDB = mongoose.model('Route', routeSchema);
};

Route.prototype.insertData = function(data) {
    var self = this;
    // Recebendo os parâmetros da requisição
    // create a new user
    var newRouteData = self.routeDB(data);

    // save the user
    newRouteData.save(function(err) {
        if (err) {
            log.appendToLog(err);
            console.log(err);
            return;
        }
        log.appendToLog('Route value insert.');
        console.log('Route value insert!');
    });
};

module.exports = Route;
