/* global Backbone, normalizeString, app */

window.ConfigSiteView = Backbone.View.extend({
  //keyloc: "&sensor=false",
  //validinifile: false,
  //inputchanged: false,
  //continue: false,
  events: {    
  },
  initialize: function () {
  },  
  init: function () {
    var self = this;
    //$("#server-ip:input").inputmask();
    //$('body').on('input', function (e) {
    //  self.inputchanged = true;
    //});
    //showInfoMsg(false, '.my-modal');
    $.AdminLTE.boxWidget.activate();

    console.log("Teste123");
    modem("GET",
            "/gethtmltext",
            function (data) {
              console.log(data);
              $("#htmlcode").html(data.body);
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },  
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
