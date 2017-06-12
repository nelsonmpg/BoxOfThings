'use strict';
module.exports = function(app) {
  var box = require('../controllers/boxApiController');


  // todoList Routes
  app.route('/allInfo')
    .get(box.get_all_info);
    //.post(todoList.create_a_task);


  app.route('/singleMoteAllInfo/:moteIp').get(box.single_mote_all_info);
    //.put(todoList.update_a_task)
    //.delete(todoList.delete_a_task);

  app.route('/moteAction/:moteIp/:resource').get(box.mote_action);

  app.route('/singleMoteSingleInfo/:moteIp/:resource').get(box.single_mote_single_info);
    //.put(todoList.update_a_task)
    //.delete(todoList.delete_a_task);
};
