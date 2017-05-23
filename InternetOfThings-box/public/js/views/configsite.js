/* global Backbone, normalizeString, app */

window.ConfigSiteView = Backbone.View.extend({
  //keyloc: "&sensor=false",
  //validinifile: false,
  //inputchanged: false,
  //continue: false,
  events: {  
    "click .gm a": "setHtmlPage",
    "click button": "getDataSensores",
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
            "/getHtmlText/" + $(e.target).attr('href'),
            function (data) {
              $("#htmlcode").html(data.body);
            },
            function (xhr, ajaxOptions, thrownError) {
              var json = JSON.parse(xhr.responseText);
              error_launch(json.message);
            }, {}
    );
  },
  getDataSensores: function(e){
    var self = this;
    var endereco = $.trim($("#endereco").val()) === "" ? "undefined" : $("#endereco").val(),
    folder = $.trim($("#folder").val()) === "" ? "undefined" : $("#folder").val(),
    resource = $.trim($("#resource").val()) === "" ? "undefined" : '"' + $("#resource").val() + '"',
    params = $.trim($("#params").val()) === "" ? "undefined" : $("#params").val(),
    payload = $.trim($("#payload").val()) === "" ? "undefined" : $("#payload").val(),
    mMethod = $.trim($("#mMethod").val()) === "" ? "undefined" : $("#mMethod").val(),
    mObserve = $.trim($("#mObserve").val()) === "" ? "undefined" : $("#mObserve").val(),
    func = e.target.id === "getdata" ? "getDataSensor" : "threadgetDataSensor";

    modem("GET",
            "/api/sensor/" + func + "/" + endereco + "/" + folder + "/" + resource + "/" + params + "/" + payload + "/" + mMethod + "/" + mObserve,
            function (data) {
              console.log(data);
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
