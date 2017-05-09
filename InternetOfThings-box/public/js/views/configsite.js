/* global Backbone, normalizeString, app */

window.ConfigSiteView = Backbone.View.extend({
  location: "http://maps.google.com/maps/api/geocode/json?address=",
  keyloc: "&sensor=false",
  validinifile: false,
  inputchanged: false,
  continue: false,
  events: {
    'change #selectplant': "imagePlant",
    'dragenter #plantlocalsensor': function (e) {
      e.stopPropagation();
      e.preventDefault();
      $(e.currentTarget).css({
        'border': '2px solid #0B85A1',
        "-webkit-box-shadow": "5px 5px 2px #888888",
        "-moz-box-shadow": "5px 5px 2px #888888",
        "box-shadow": "5px 5px 2px #888888"
      });
    },
    'dragleave #plantlocalsensor': function (e) {
      $(e.currentTarget).css({
        'border': '2px dotted #0B85A1',
        "-webkit-box-shadow": "2px 2px 1px #888888",
        "-moz-box-shadow": "2px 2px 1px #888888",
        "box-shadow": "2px 2px 1px #888888"
      });
    },
    'dragover #plantlocalsensor': function (e) {
      e.stopPropagation();
      e.preventDefault();
    },
    "contextmenu #imgsensor, #plantlocalsensor": function (event) {
      if ($('#sensor-posx').val() != 0 || $('#sensor-posy').val() != 0 || $(event.currentTarget).attr("id") == "plantlocalsensor") {
        // Avoid the real one
        event.preventDefault();
        // Show contextmenu
        $(".custom-menu").finish().toggle(100).
                // In the right position (the mouse)
                css({
                  top: event.pageY + "px",
                  left: event.pageX + "px"
                });
      }
    },
    "mousedown #imgsensor, #plantlocalsensor": function (e) {
      // If the clicked element is not the menu
      if (!$(e.target).parents(".custom-menu").length > 0) {
        // Hide it
        $(".custom-menu").hide(100);
      }
    },
    "click .custom-menu li": function (e) {
      // This is the triggered action name
      switch ($(e.currentTarget).attr("data-action")) {
        // A case for each action. Your actions here
        case "remove":
          //alert("first");  
          var elem = $('#imgsensor').clone();
          $("#addimagesensor").html("");
          $("#addimagesensor").append(elem);
          $('#sensor-posx').val(0);
          $('#sensor-posy').val(0);
          $("#imgsensor").animate({
            top: 0,
            left: 0
          }).draggable({
            containment: $('body'),
            stop: function () {
              var finalOffset = $(this).offset();
              var finalxPos = (finalOffset.left - $('#posiSensor').offset().left) * 100 / $('#posiSensor').width();
              var finalyPos = (finalOffset.top - $('#posiSensor').offset().top) * 100 / $('#posiSensor').height();
              if (finalxPos >= 0 && finalyPos >= 0) {
                $('#sensor-posx').val(finalxPos);
                $('#sensor-posy').val(finalyPos);
              }
            },
            revert: 'invalid'
          });
          break;
        case "removeplant":
          $('#plantlocalsensor').css({
            'border': "none",
            "-webkit-box-shadow": "none",
            "-moz-box-shadow": "none",
            "box-shadow": "none",
            "background-image": "none"
          });
          break;
      }
      // Hide it AFTER the action was triggered
      $(".custom-menu").hide(100);
    }
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

    console.log("Teste123");
    modem("GET",
            "/gethtmltext",
            function (data) {
              console.log(data);
              $("#htmlcode").html(data);
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
