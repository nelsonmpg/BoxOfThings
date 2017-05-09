/* global Backbone, normalizeString, app */

window.ConfigSiteView = Backbone.View.extend({
  //keyloc: "&sensor=false",
  //validinifile: false,
  //inputchanged: false,
  //continue: false,
  events: {  
  "click .gm a": "setHtmlPage"  
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

    modem("GET",
            "/getHtmlText/index.html",
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
  setHtmlPage: function(e) {
    e.preventDefault();
    var self = this;    

    modem("GET",
            "/getHtmlText/" + $(e.target).text(),
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
