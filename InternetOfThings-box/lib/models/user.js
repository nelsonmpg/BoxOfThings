// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema User
var userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    pass: { type: String, required: true }
});

var User = function() {
    var self = this;
    this.UserDB = mongoose.model('User', userSchema);
};

User.prototype.loginUser = function(params, res) {
    var self = this;
    this.UserDB.findOne(params, function(err, user) {
        if (err) {
            res.json({
                status: "error",
                stdout: err
            });
        } else if (!user) {
            res.json({
                status: "login error",
                stdout: "O utilizador não foi encontrrado"
            });
        } else {
            res.json({
                status: "login OK",
                stdout: ""
            });
        }
    });
};

User.prototype.InsertUser = function(params, res) {
    var self = this;
    // Recebendo os parâmetros da requisição
    // create a new user
    var newUser = this.UserDB(params);

    // save the user
    newUser.save(function(err) {
        if (err) {
            return;
        }
        console.log('User created!');
        if (res) {
            res.json('ok ');
        }
    });
};

// make this available to our users in our Node applications
module.exports = User;
