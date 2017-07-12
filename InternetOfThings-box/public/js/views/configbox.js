/* global Backbone, normalizeString, app */

window.ConfigBoxView = Backbone.View.extend({
    userRegex: /^\w+$/,
    yearRegex: /^(20[1-9]\d|20[0-9]\d|2100)$/,
    cpostalRegex: /^\d{4}(-\d{3})?$/,
    phoneRegex: /^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{3})$/,
    numberRegex: /^\d+(\.\d+)?$/,
    pathRegex: /^(\/[^\/ ]*)+\/?$/,
    macRegex: /^[0-9a-f]{1,2}([\.:-])(?:[0-9a-f]{1,2}\1){4}[0-9a-f]{1,2}$/,
    ipRegex: /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/,
    ValidHostnameRegex: /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/,
    portRegex: /^0*(?:6553[0-5]|655[0-2][0-9]|65[0-4][0-9]{2}|6[0-4][0-9]{3}|[1-5][0-9]{4}|[1-9][0-9]{1,3}|[0-9])$/,
    events: {
        "keyup .valid-input": "checkImputs",
        "click #save-settings": "savesettings"
    },
    initialize: function() {},
    init: function() {
        var self = this;

        showInfoMsg(false, '.my-modal');
        $.AdminLTE.boxWidget.activate();

        modem("GET",
            "/paramsinifile",
            function(data) {
                if (data.status === "File Ok") {
                    $("#box-name").val(data.stdout.boxparams.name);
                    $("#box-mac").val(data.stdout.boxparams.mac);
                    $("#box-model").val(data.stdout.boxparams.model);
                    $("#box-version").val(data.stdout.boxparams.version);
                    $("#box-name-code").val(data.stdout.boxparams.Serial);
                    $("#box-type").val(data.stdout.boxparams.type);
                    $("#box-local").val(data.stdout.boxparams.manuf);
                    $("#box-latitude").val(data.stdout.boxparams.coordN);
                    $("#box-longitude").val(data.stdout.boxparams.coordW);
                    $("#box-client-name").val(data.stdout.boxparams.clientName);
                    $("#box-client-address").val(data.stdout.boxparams.address);
                    $("#box-client-postalcode").val(data.stdout.boxparams.code);
                    $("#box-client-city").val(data.stdout.boxparams.locality);
                    $("#box-client-phone").val(data.stdout.boxparams.phone);
                    $("#box-year-install").val(data.stdout.boxparams.yearinstall);
                    $("#local-ip").val(data.stdout.localip);
                    $("#local-port").val(data.stdout.localport);
                    $("#remote-port").val(data.stdout.remoteport);
                    $("#remote-user").val(data.stdout.remoteuser);
                    $("#remote-ip").val(data.stdout.remoteip);
                    $("#remote-defport").val(data.stdout.sshport);
                    $("#local-privatekey").val(data.stdout.privatersa);
                    $("#local-pboxname").val(data.stdout.boxname);
                    $("#remote-script").val(data.stdout.remotepathscript);
                    $(".slider-time-sensors-value").text(data.stdout.timequery + " seonds");
                    $(".slider-time-sensors").slider('setValue', data.stdout.timequery);
                    $(".slider-time-datafusion-value").text(data.stdout.timedatafusion + " minutes");
                    $(".slider-time-datafusion").slider('setValue', data.stdout.timedatafusion);
                } else {
                    showmsg('.my-modal', "error", "Error to load file settings. The system insert a default params." + data.status, true);
                    self.getdefaultvalues();
                }
                self.checkImputs();
            },
            function(xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                showmsg('.my-modal', "error", "Error to load file settings. The system insert a default params." + json.message, true);
                self.getdefaultvalues();
                // error_launch(json.message);
            }, {});

        $(self.el).find('.slider-time-sensors, .slider-time-datafusion').slider().on('slide', function(ev) {
            $(self.el).find("." + $(ev.target).data("extid") + "-value").text(this.value + ($(ev.target).data("extid") === "slider-time-sensors" ? " seonds" : " minutes"));
        });
        $(self.el).find(".slider").css({ width: "100%" });
        $(self.el).find(".slider-time-sensors-value, .slider-time-datafusion").parent().css({ "margin-top": 0 });
    },
    getdefaultvalues: function() {
        var self = this;
        modem("GET",
            "/defaultparamsinifile",
            function(data) {
                if (data.status === "File Ok") {
                    $("#box-name").val(data.stdout.boxparams.name);
                    $("#box-mac").val(data.stdout.boxparams.mac);
                    $("#box-model").val(data.stdout.boxparams.model);
                    $("#box-version").val(data.stdout.boxparams.version);
                    $("#box-name-code").val(data.stdout.boxparams.Serial);
                    $("#box-type").val(data.stdout.boxparams.type);
                    $("#box-local").val(data.stdout.boxparams.manuf);
                    $("#box-latitude").val(data.stdout.boxparams.coordN);
                    $("#box-longitude").val(data.stdout.boxparams.coordW);
                    $("#box-client-name").val(data.stdout.boxparams.clientName);
                    $("#box-client-address").val(data.stdout.boxparams.address);
                    $("#box-client-postalcode").val(data.stdout.boxparams.code);
                    $("#box-client-city").val(data.stdout.boxparams.locality);
                    $("#box-client-phone").val(data.stdout.boxparams.phone);
                    $("#box-year-install").val(data.stdout.boxparams.yearinstall);
                    $("#local-ip").val(data.stdout.localip);
                    $("#local-port").val(data.stdout.localport);
                    $("#remote-port").val(data.stdout.remoteport);
                    $("#remote-user").val(data.stdout.remoteuser);
                    $("#remote-ip").val(data.stdout.remoteip);
                    $("#remote-defport").val(data.stdout.sshport);
                    $("#local-privatekey").val(data.stdout.privatersa);
                    $("#local-pboxname").val(data.stdout.boxname);
                    $("#remote-script").val(data.stdout.remotepathscript);
                    $(".slider-time-sensors-value").text(data.stdout.timequery + " seonds");
                    $(".slider-time-sensors").slider('setValue', data.stdout.timequery);
                    $(".slider-time-datafusion-value").text(data.stdout.timedatafusion + " minutes");
                    $(".slider-time-datafusion").slider('setValue', data.stdout.timedatafusion);
                } else {
                    showmsg('.my-modal', "error", "Error to load default settings." + data.status, true);
                }
                self.checkImputs();
            },
            function(xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                error_launch(json.message);
            }, {});
    },
    checkImputs: function() {
        var self = this;
        $('.valid-input').each(function(i, obj) {
            if ($(obj).val() && !$.isArray($(obj).val())) {
                $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                var testOk = false;
                switch ($(obj).data("typevalue")) {
                    case "local-ip":
                    case "remote-ip":
                        if ($(obj).val().trim().match(self.ipRegex) || $(obj).val().trim().match(self.ValidHostnameRegex)) {
                            testOk = true;
                        } else {
                            testOk = false;
                        }
                        break;
                    case "local-port":
                    case "remote-port":
                    case "remote-defport":
                        if ($(obj).val().trim().match(self.portRegex)) {
                            testOk = true;
                        } else {
                            testOk = false;
                        }
                        break;
                    case "remote-user":
                        if ($(obj).val().trim().match(self.userRegex)) {
                            testOk = true;
                        } else {
                            testOk = false;
                        }
                        break;
                    case "local-privatekey":
                    case "remote-script":
                        if ($(obj).val().trim().match(self.pathRegex)) {
                            testOk = true;
                        } else {
                            testOk = false;
                        }
                        break;
                    case "box-mac":
                        if ($(obj).val().trim().match(self.macRegex)) {
                            testOk = true;
                        } else {
                            testOk = false;
                        }
                        break;
                    case "box-name":
                    case "box-local":
                    case "box-client-name":
                    case "box-client-address":
                    case "box-client-city":
                        if ($(obj).val().trim().length > 3) {
                            testOk = true;
                        } else {
                            testOk = false;
                        }
                        break;
                    case "box-model":
                    case "box-version":
                    case "box-type":
                    case "box-latitude":
                    case "box-longitude":
                        if ($(obj).val().trim().match(self.numberRegex) && $(obj).val().trim().length > 0) {
                            testOk = true;
                        } else {
                            testOk = false;
                        }
                        break;
                    case "box-client-postalcode":
                        if ($(obj).val().trim().match(self.cpostalRegex)) {
                            testOk = true;
                        } else {
                            testOk = false;
                        }
                        break;
                    case "box-client-phone":
                        if ($(obj).val().trim().match(self.phoneRegex)) {
                            testOk = true;
                        } else {
                            testOk = false;
                        }
                        break;
                    case "box-year-install":
                        if ($(obj).val().trim().match(self.yearRegex)) {
                            testOk = true;
                        } else {
                            testOk = false;
                        }
                        break;
                }

                if (testOk) {
                    $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                } else {
                    $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                }
            }
        });
    },
    savesettings: function() {
        var self = this;
        self.checkImputs();
        if (($(".valid-input").length == $(".fa-check").length) ? true : false) {
            var configsshData = {
                localip: $("#local-ip").val(),
                localport: $("#local-port").val(),
                remoteport: $("#remote-port").val(),
                remoteuser: $("#remote-user").val(),
                remoteip: $("#remote-ip").val(),
                sshport: $("#remote-defport").val(),
                privatersa: $("#local-privatekey").val(),
                remotepathscript: $("#remote-script").val(),
                boxparams: {
                    name: $("#box-name").val(),
                    mac: $("#box-mac").val(),
                    model: $("#box-model").val(),
                    version: $("#box-version").val(),
                    Serial: $("#box-name-code").val(),
                    type: $("#box-type").val(),
                    manuf: $("#box-local").val(),
                    coordN: $("#box-latitude").val(),
                    coordW: $("#box-longitude").val(),
                    clientName: $("#box-client-name").val(),
                    address: $("#box-client-address").val(),
                    code: $("#box-client-postalcode").val(),
                    locality: $("#box-client-city").val(),
                    phone: $("#box-client-phone").val(),
                    yearinstall: $("#box-year-install").val()
                },
                timequery: $(".slider-time-sensors-value").text().trim().split(" ")[0],
                timedatafusion: $(".slider-time-datafusion-value").text().trim().split(" ")[0]
            }
            console.log(configsshData);
            modem("POST",
                "/savesettings",
                function(data) {
                    if (data.status === "ok") {
                        showmsg('.my-modal', "warning", "The file is saved restart node system.", false);
                    } else {
                        showmsg('.my-modal', "error", "Error to save settings." + data.status, false);
                    }
                },
                function(xhr, ajaxOptions, thrownError) {
                    var json = JSON.parse(xhr.responseText);
                    error_launch(json.message);
                }, { data: configsshData });
        } else {
            showmsg('.my-modal', "error", "Bad Values to Save, check the <i class='icon fa fa-close'>.", true);
        }
    },
    render: function() {
        var self = this;
        $(this.el).html(this.template());
        return this;
    }
});
