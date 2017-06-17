/* global Backbone, normalizeString, app */
window.ConfigSiteView = Backbone.View.extend({
    enrecoOpts: "",
    events: {
        "click .gm a": "setHtmlPage",
        "click #getdata": "getDataSensores",
        "click #btn-folder-opts li a": function(e) {
            var self = this;
            $("#folder").val($(e.target).text());
            e.preventDefault();
        },
        "click #btn-endereco-opts li a": function(e) {
            var self = this;
            $("#endereco").val($(e.target).text());
            e.preventDefault();
        },
        "click #btn-endereco1-opts1 li a": function(e) {
            var self = this;
            $("#api-endereco1").val($(e.target).text());
            e.preventDefault();
        },
        "click #btn-endereco2-opts2 li a": function(e) {
            var self = this;
            $("#api-endereco2").val($(e.target).text());
            e.preventDefault();
        },
        "click #btn-endereco3-opts3 li a": function(e) {
            var self = this;
            $("#api-endereco3").val($(e.target).text());
            e.preventDefault();
        },
        "click #btn-mMethod-opts li a": function(e) {
            var self = this;
            $("#mMethod").val($(e.target).text());
            e.preventDefault();
        },
        "click #btn-color-opts li a": function(e) {
            var self = this;
            $("#api-color").val($(e.target).text());
            e.preventDefault();
        },
        "click #btn-mode-opts li a": function(e) {
            var self = this;
            $("#api-mode").val($(e.target).text());
            e.preventDefault();
        },
        "click #api-getdata1": function() {
            if ($("#api-endereco1").val().trim().length > 0) {
                modem("GET",
                    "/api/singleMoteAllInfo/" + $("#api-endereco1").val(),
                    function(data) {
                        console.log(data);
                        $("#textarea-text1").text(data);
                    },
                    function(xhr, ajaxOptions, thrownError) {
                        var json = JSON.parse(xhr.responseText);
                        error_launch(json.message);
                    }, {});
            } else {
                showmsg('.my-modal', "error", "Tem que introduzir um endereço.", true);
            }
        },
        "click #api-getdata2": function() {
            if ($("#api-endereco2").val().trim().length > 0 && $("#api-resource2").val().trim().length > 0) {
                modem("GET",
                    "/api/singleMoteSingleInfo/" + $("#api-endereco2").val() + "/" + $("#api-resource2").val(),
                    function(data) {
                        console.log(data);
                        $("#textarea-text2").text(data);
                    },
                    function(xhr, ajaxOptions, thrownError) {
                        var json = JSON.parse(xhr.responseText);
                        error_launch(json.message);
                    }, {});
            } else {
                showmsg('.my-modal', "error", "Tem que introduzir um endereço e o resource.", true);
            }
        },
        "click #api-sensoraction": function() {
            if ($("#api-endereco3").val().trim().length > 0 && $("#api-resource3").val().trim().length > 0 && $("#api-color").val().trim().length > 0 && $("#api-mode").val().trim().length > 0) {
                modem("GET",
                    "/api/singleMoteSingleInfo/" + $("#api-endereco3").val().trim() + "/" + $("#api-resource3").val().trim() + "/" + $("#api-color").val().trim().toLowerCase().charAt(0) + "/" + $("#api-mode").val().trim().toLowerCase(),
                    function(data) {
                        console.log(data);
                        $("#textarea-text3").text(data);
                    },
                    function(xhr, ajaxOptions, thrownError) {
                        var json = JSON.parse(xhr.responseText);
                        error_launch(json.message);
                    }, {});
            } else {
                showmsg('.my-modal', "error", "Tem que introduzir um endereço, resource, a cor e o modo.", true);
            }
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
            }, {});


        modem("GET",
            "/routes/alladdress",
            function(data) {
                var opts = '<li><a href="#">&nbsp;</a></li>';
                for (var i in data.stdout) {
                    opts += '<li><a href="#">[' + data.stdout[i].split("/")[0] + ']</a></li>';
                }
                self.enrecoOpts = opts;

                $("#btn-endereco-opts").html(self.enrecoOpts);
                $("#btn-endereco1-opts1").html(self.enrecoOpts);
                $("#btn-endereco2-opts2").html(self.enrecoOpts);
                $("#btn-endereco3-opts3").html(self.enrecoOpts);
            },
            function(xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
            }, {});
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
            mObserve = $.trim($("#mObserve").val()) === "" ? "undefined" : $("#mObserve").val();

console.log("/api/sensor/getDataSensor/" + endereco + "/" + folder + "/" + resource.replace("?", "§") + "/" + params + "/" + payload + "/" + mMethod + "/" + mObserve);

        modem("GET",
            "/api/sensor/getDataSensor/" + endereco + "/" + folder + "/" + resource.replace("?", "§") + "/" + params + "/" + payload + "/" + mMethod + "/" + mObserve,
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
