// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var self = this;

// create a schema User
var userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    pass: { type: String, required: true }
});

// create a schema Sensor
var sensorSchema = new Schema({
    name: {type: String} ,
    ip: {type: String} ,
    value : {type: String} ,
    created_at: {type: Date}
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
        //console.log(user);
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

/*-------------------------------------------------------------------------------------*/
var Sensor = function(cfg){
  var self = this;
  this.SensorDB = mongoose.model('Sensor', sensorSchema);
};

Sensor.prototype.insertData = function(data){

  var self = this;
    // Recebendo os parâmetros da requisição
    // create a new user
    var newSensorData = self.SensorDB(data);

    // save the user
    newSensorData.save(function(err) {
        if (err) {
            return;
        }
        console.log('Sensor value add / created!');    
    });
};

module.exports.User = User;
module.exports.Sensor = Sensor;