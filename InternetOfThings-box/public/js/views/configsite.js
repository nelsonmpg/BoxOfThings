/* global Backbone, normalizeString, app */

window.ConfigSiteView = Backbone.View.extend({
    events: {
        "click .gm a": "setHtmlPage",
        "click button": "getDataSensores",
        "click #api-getdata1": function() {
            modem("GET",
                "/api/singleMoteAllInfo/" + $("#api-endereco1").val(),
                function(data) {
                    console.log(data);
                },
                function(xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                }, {}
            );
        },
        "click #api-getdata2": function() {
            modem("GET",
                "/api/moteAction/" + $("#api-endereco2").val() + "/" + $("#api-resource2").val() ,
                function(data) {
                    console.log(data);
                },
                function(xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                }, {}
            );
        },
    },
    initialize: function() {},
    init: function() {
        var self = this;
        $.AdminLTE.boxWidget.activate();

        modem("GET",
            "/getHtmlText/index.html",
            function(data) {
                $("#htmlcode").html(data.body);
            },
            function(xhr, ajaxOptions, thrownError) {
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
            function(data) {
                $("#htmlcode").html(data.body);
            },
            function(xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
            }, {}
        );
    },
    getDataSensores: function(e) {
        var self = this;
        var endereco = $.trim($("#endereco").val()) === "" ? "undefined" : $("#endereco").val(),
            folder = $.trim($("#folder").val()) === "" ? "undefined" : $("#folder").val(),
            resource = $.trim($("#resource").val()) === "" ? "undefined" : $("#resource").val(),
            params = $.trim($("#params").val()) === "" ? "undefined" : $("#params").val(),
            payload = $.trim($("#payload").val()) === "" ? "undefined" : $("#payload").val(),
            mMethod = $.trim($("#mMethod").val()) === "" ? "undefined" : $("#mMethod").val(),
            mObserve = $.trim($("#mObserve").val()) === "" ? "undefined" : $("#mObserve").val(),
            func = e.target.id === "getdata" ? "getDataSensor" : "threadgetDataSensor";

        modem("GET",
            "/api/sensor/" + func + "/" + endereco + "/" + folder + "/" + resource.replace("?", "§") + "/" + params + "/" + payload + "/" + mMethod + "/" + mObserve,
            function(data) {
                console.log(data);
            },
            function(xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
            }, {}
        );

    },
    render: function() {
        var self = this;
        $(this.el).html(this.template());
        return this;
    }
});
