// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var self = this;

// create a schema
var userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    pass: {
        type: String,
        required: true
    }
});

// the schema is useless so far
// we need to create a model using it
var User = function(cfg) {
	var self = this;
    this.UserDB = mongoose.model('User', userSchema);

    self.config = cfg;
    // connect to mongo db
    this.connStr = self.config.dataBaseType + '://' + self.config.host + '/' + self.config.dbname;
    mongoose.connect(this.connStr, function(err) {
        if (err) {
            throw err;
        }
        console.log("Successfully connected to MongoDB");
    });
};

User.prototype.loginUser = function(params, res, next) {
	var self = this;
    this.UserDB.findOne(params, function(err, user) {
        if (err) {
            return next(new Error('failed to find user'));
        }
        if (!user) {
            return next(new Error('failed to find user'));
        }
        // object of the user
        console.log(user);
        res.json("userOk");
        next();
    });
};

User.prototype.InsertUser = function(params, res, next) {
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
        if (next) {
        	res.json('ok');
        }        
    });
};

// make this available to our users in our Node applications
module.exports = User;