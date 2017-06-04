/* global Backbone, normalizeString, app */

window.ConfigBoxView = Backbone.View.extend({
  //keyloc: "&sensor=false",
  //validinifile: false,
  //inputchanged: false,
  //continue: false,
  events: {  
    "keyup .valid-input" : "checkImputs",
    "click #save-settings": "savesettings"
  },
  initialize: function () {
  },  
  init: function () {
    var self = this;
    $("#server-ip:input").inputmask();
    $('body').on('input', function (e) {
     self.inputchanged = true;
   });
    showInfoMsg(false, '.my-modal');
    $.AdminLTE.boxWidget.activate();

    modem("GET",
     "/paramsinifile",
     function (data) {
      if (data.status === "File Ok") {
        $("#local-ip").val(data.stdout.localip);
        $("#local-port").val(data.stdout.localport);
        $("#remote-port").val(data.stdout.remoteport);
        $("#remote-user").val(data.stdout.remoteuser);
        $("#remote-ip").val(data.stdout.remoteip);
        $("#remote-defport").val(data.stdout.sshport);
        $("#local-privatekey").val(data.stdout.privatersa);
        $("#local-pboxname").val(data.stdout.boxname);        
      } else {
        showmsg('.my-modal', "error", "Error to load file settings." + data.status, true);
      }
    },
    function (xhr, ajaxOptions, thrownError) {
     var json = JSON.parse(xhr.responseText);
     error_launch(json.message);
   }, {});




    self.checkImputs();
  },  
  checkImputs: function () {
    var self = this;
    $('.valid-input').each(function (i, obj) {
      if ($(obj).val() && !$.isArray($(obj).val())) {
        $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
        switch ($(obj).data("typevalue")) {
          case "local-ip":
          case "remote-ip":
          //"127.0.0.1".match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/);
          var ipRegex = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/;
          if ($(obj).val().trim().match(ipRegex)) {
            $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
          } else {
            $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
          }
          break;
          case "local-port":
          case "remote-port":
          case "remote-defport":
          var portRegex = /^0*(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/;
          if ($(obj).val().trim().match(portRegex)) {
            $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
          } else {
            $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
          }
          break;
          case "remote-user":
          case "local-pboxname":
          var userRegex = /^\w+$/;
          if ($(obj).val().trim().match(userRegex)) {
            $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
          } else {
            $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
          }
          break;
          case "local-privatekey":
          var pathRgex = /^(\/[^\/ ]*)+\/?$/;
          if ($(obj).val().trim().match(pathRgex) && $(obj).val().trim().length > 5) {
            $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
          } else {
            $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
          }
          break;
        }
      }
    });
  },
  savesettings: function(){
    var self = this;
    if (($(".valid-input").length == $(".fa-check").length) ? true : false) {
      var configsshData = {
        localip : $("#local-ip").val(),
        localport : $("#local-port").val(),
        remoteport : $("#remote-port").val(),
        remoteuser : $("#remote-user").val(),
        remoteip : $("#remote-ip").val(),
        sshport : $("#remote-defport").val(),
        privatersa : $("#local-privatekey").val(),
        boxname : $("#local-pboxname").val()
      }

      modem("POST",
       "/savesettings",
       function (data) {
         if (data.status === "ok") {
          showmsg('.my-modal', "warning", "The file is saved restart node system.", false);
        } else {
          showmsg('.my-modal', "error", "Error to save settings." + data.status, false);
        }
      },
      function (xhr, ajaxOptions, thrownError) {
       var json = JSON.parse(xhr.responseText);
       error_launch(json.message);
     }, {data: configsshData});
    } else {
      showmsg('.my-modal', "error", "Bad Values to Save, check the <i class='icon fa fa-close'>.", true);
    }
  },
  render: function () {
    var self = this;
    $(this.el).html(this.template());
    return this;
  }
});
