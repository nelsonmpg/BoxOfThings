/* global Backbone, normalizeString, app */
window.ConfigSiteView = Backbone.View.extend({
    enrecoOpts: "",
    events: {
        "click .gm a": "setHtmlPage",
        "click #getdata": "getDataSensores",
        "click .querydb": function(e) {
            var self = this;
            self.callmethodsMote($(e.target).text(), "#" + $(e.target).parent().parent().attr("data-dest-dp"), $(e.target).parent().parent().attr("data-dest-dp2"));
            e.preventDefault();
        },
        "click .dropdown-menu li a": function(e) {
            var self = this;
            $("#" + $(e.target).parent().parent().attr("data-dest")).val($(e.target).text());
             $("." + $(e.target).parent().parent().attr("data-clear")).val("");
            e.preventDefault();
        },
        "click #api-getdata1": function() {
            if ($("#api-endereco1").val().trim().length > 0) {
                modem("GET",
                    "/api/singleMoteAllInfo/" + $("#api-endereco1").val(),
                    function(data) {
                        console.log(data);
                        $("#textarea-text1").val(data);
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
                        $("#textarea-text2").val(data);
                    },
                    function(xhr, ajaxOptions, thrownError) {
                        var json = JSON.parse(xhr.responseText);
                        error_launch(json.message);
                    }, {});
            } else {
                showmsg('.my-modal', "error", "Tem que introduzir um endereço e o resource.", true);
            }
        },
        "click #api-sensoraction": function() {//$("#api-color").val().trim().toLowerCase().charAt(0)
            if ($("#api-endereco3").val().trim().length > 0 && $("#api-resource3").val().trim().length > 0 && $("#api-mode").val().trim().length > 0) {
                modem("GET",
                    "/api/moteAction/" + $("#api-endereco3").val().trim() + "/" + $("#api-resource3").val().trim() + "/" + $("#api-resource3").val().trim().toLowerCase().replace("led", "").charAt(0) + "/" + $("#api-mode").val().trim().toLowerCase(),
                    function(data) {
                        console.log(data);
                        $("#textarea-text3").val(data);
                    },
                    function(xhr, ajaxOptions, thrownError) {
                        var json = JSON.parse(xhr.responseText);
                        error_launch(json.message);
                    }, {});
            } else {
                showmsg('.my-modal', "error", "Tem que introduzir um endereço, resource, a cor e o modo.", true);
            }
        }
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
            function(data) {// stdout
                if (data.status === "sensors ok") {
                    var opts = '<li><a href="#">&nbsp;</a></li>';
                    for (var i in data.stdout) {
                        opts += '<li><a href="#">' + data.stdout[i].ip + '</a></li>';
                    }
                    self.enrecoOpts = opts;

                    $("#btn-endereco-opts").html(self.enrecoOpts);
                    $("#btn-endereco1-opts1").html(self.enrecoOpts);
                    $("#btn-endereco2-opts2").html(self.enrecoOpts);
                    $("#btn-endereco3-opts3").html(self.enrecoOpts);
                }
            },
            function(xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
            }, {});
    },
    callmethodsMote : function(mote, local, local2){
        modem("GET",
            "/api/mote/" + mote,
            function(data) {
                if (data.status === "methods ok") {
                    var opts = '<li><a href="#">&nbsp;</a></li>';
                    var opts2 = '<li><a href="#">&nbsp;</a></li>';
                    for (var i in data.stdout[0].methods) {
                        opts += '<li><a href="#">' + data.stdout[0].methods[i].resource + '</a></li>';
                        if (local2) {
                         opts2 += '<li><a href="#">' + data.stdout[0].methods[i].folder + '</a></li>';
                     }
                 }
                 if (local2) {
                    $("#" + local2).html(opts2);
                }
                self.enrecoOpts = opts;
                $(local).html(self.enrecoOpts);
            }
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
        if ($("#endereco").val().trim().length > 0 && $("#folder").val().trim().length > 0 && $("#resource").val().trim().length > 0) {
            var endereco = $("#endereco").val().trim().length === 0 ? "undefined" : $("#endereco").val(),
            folder = $("#folder").val().trim().length === 0 ? "undefined" : $("#folder").val(),
            resource = $("#resource").val().trim().length === 0 ? "undefined" : $("#resource").val(),
            params = $("#params").val().trim().length === 0 ? "undefined" : $("#params").val(),
            payload = $("#payload").val().trim().length === 0 ? "undefined" : $("#payload").val(),
            mMethod = $("#mMethod").val().trim().length === 0 ? "undefined" : $("#mMethod").val(),
            mObserve = $("#mObserve").val().trim().length === 0 ? "undefined" : $("#mObserve").val();

            console.log("/api/sensor/getDataSensor/" + endereco + "/" + folder + "/" + resource.replace("?", "§") + "/" + params + "/" + payload + "/" + mMethod + "/" + mObserve);

            modem("GET",
                "/api/sensor/getDataSensor/" + endereco + "/" + folder + "/" + resource.replace("?", "§") + "/" + params + "/" + payload + "/" + mMethod + "/" + mObserve,
                function(data) {
                    console.log(data);
                    $("#textarea-text").val(data);
                },
                function(xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                }, {});
        } else {
            showmsg('.my-modal', "error", "Tem que introduzir um endereço, folder, a resource.", true);
        }
    },
    render: function() {
        var self = this;
        $(this.el).html(this.template());
        return this;
    }
});
