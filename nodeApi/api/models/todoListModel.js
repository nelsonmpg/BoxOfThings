
'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var TaskSchema = new Schema({
  idBox: {
    type: String,
    Required: 'Please enter a box id'
  },
  macBox: {
    type: String,
    Required: 'Please enter a box MAC ADDRESS'
  },
  motes: {
    type: [{}]
  }
  Created_date: {
    type: Date,
    default: Date.now
  },

});

module.exports = mongoose.model('MoteInfo', TaskSchema);
