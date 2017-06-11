/* global Backbone, normalizeString, app */

window.ConfigBoxView = Backbone.View.extend({
    userRegex: /^\w+$/,
    yearRegex: /^(20[1-9]\d|20[0-9]\d|2100)$/,
    cpostalRegex: /^\d{4}(-\d{3})?$/,
    phoneRegex: /^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{3})$/,
    numberRegex: /^\d+(\.\d)?$/,
    pathRegex: /^(\/[^\/ ]*)+\/?$/,
    macRegex: /^[0-9a-f]{1,2}([\.:-])(?:[0-9a-f]{1,2}\1){4}[0-9a-f]{1,2}$/,
    ipRegex: /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/,
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
                    $("#box-name").val(data.stdout.boxname);
                    $("#box-name-code").val(data.stdout.boxSerial);
                    $("#box-mac").val(data.stdout.macaddess);
                    $("#box-model").val(data.stdout.boxmodel);
                    $("#box-version").val(data.stdout.boxversion);
                    $("#box-type").val(data.stdout.boxtype);
                    $("#box-local").val(data.stdout.boxlocal);
                    $("#box-latitude").val(data.stdout.boxlatitude);
                    $("#box-longitude").val(data.stdout.boxlongitude);
                    $("#box-client-name").val(data.stdout.boxclientname);
                    $("#box-client-address").val(data.stdout.boxclientaddress);
                    $("#box-client-postalcode").val(data.stdout.boxclientpostalcode);
                    $("#box-client-city").val(data.stdout.boxclientcity);
                    $("#box-client-phone").val(data.stdout.boxclientphone);
                    $("#box-year-install").val(data.stdout.boxyearinstall);
                    $("#local-ip").val(data.stdout.localip);
                    $("#local-port").val(data.stdout.localport);
                    $("#remote-port").val(data.stdout.remoteport);
                    $("#remote-user").val(data.stdout.remoteuser);
                    $("#remote-ip").val(data.stdout.remoteip);
                    $("#remote-defport").val(data.stdout.sshport);
                    $("#local-privatekey").val(data.stdout.privatersa);
                    $("#local-pboxname").val(data.stdout.boxname);
                } else {
                    showmsg('.my-modal', "error", "Error to load file settings. The system insert a default params." + data.status, true);
                    self.getdefaultvalues();

                }
            },
            function(xhr, ajaxOptions, thrownError) {
                var json = JSON.parse(xhr.responseText);
                showmsg('.my-modal', "error", "Error to load file settings. The system insert a default params." + json.message, true);
                self.getdefaultvalues();
                // error_launch(json.message);
            }, {});

        self.checkImputs();
    },
    getdefaultvalues: function() {
        modem("GET",
            "/defaultparamsinifile",
            function(data) {
                if (data.status === "File Ok") {
                    $("#box-name").val(data.stdout.boxname);
                    $("#box-name-code").val(data.stdout.boxSerial);
                    $("#box-mac").val(data.stdout.macaddess);
                    $("#box-model").val(data.stdout.boxmodel);
                    $("#box-version").val(data.stdout.boxversion);
                    $("#box-type").val(data.stdout.boxtype);
                    $("#box-local").val(data.stdout.boxlocal);
                    $("#box-latitude").val(data.stdout.boxlatitude);
                    $("#box-longitude").val(data.stdout.boxlongitude);
                    $("#box-client-name").val(data.stdout.boxclientname);
                    $("#box-client-address").val(data.stdout.boxclientaddress);
                    $("#box-client-postalcode").val(data.stdout.boxclientpostalcode);
                    $("#box-client-city").val(data.stdout.boxclientcity);
                    $("#box-client-phone").val(data.stdout.boxclientphone);
                    $("#box-year-install").val(data.stdout.boxyearinstall);
                    $("#local-ip").val(data.stdout.localip);
                    $("#local-port").val(data.stdout.localport);
                    $("#remote-port").val(data.stdout.remoteport);
                    $("#remote-user").val(data.stdout.remoteuser);
                    $("#remote-ip").val(data.stdout.remoteip);
                    $("#remote-defport").val(data.stdout.sshport);
                    $("#local-privatekey").val(data.stdout.privatersa);
                    $("#local-pboxname").val(data.stdout.boxname);
                } else {
                    showmsg('.my-modal', "error", "Error to load default settings." + data.status, true);
                }
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
                switch ($(obj).data("typevalue")) {
                    case "local-ip":
                    case "remote-ip":
                        if ($(obj).val().trim().match(self.ipRegex)) {
                            $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                        } else {
                            $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                        }
                        break;
                    case "local-port":
                    case "remote-port":
                    case "remote-defport":
                        if ($(obj).val().trim().match(self.portRegex)) {
                            $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                        } else {
                            $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                        }
                        break;
                    case "remote-user":
                        if ($(obj).val().trim().match(self.userRegex)) {
                            $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                        } else {
                            $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                        }
                        break;
                    case "local-privatekey":
                        if ($(obj).val().trim().match(self.pathRegex)) {
                            $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                        } else {
                            $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                        }
                        break;
                    case "box-mac":
                        if ($(obj).val().trim().match(self.macRegex)) {
                            $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                        } else {
                            $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                        }
                        break;
                    case "box-name":
                    case "box-local":
                    case "box-client-name":
                    case "box-client-address":
                    case "box-client-city":
                        if ($(obj).val().trim().length > 3) {
                            $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                        } else {
                            $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                        }
                        break;
                    case "box-model":
                    case "box-version":
                    case "box-type":
                    case "box-latitude":
                    case "box-longitude":
                        if ($(obj).val().trim().match(self.numberRegex)) {
                            $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                        } else {
                            $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                        }
                        break;
                    case "box-client-postalcode":
                        if ($(obj).val().trim().match(self.cpostalRegex)) {
                            $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                        } else {
                            $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                        }
                        break;
                    case "box-client-phone":
                        if ($(obj).val().trim().match(self.phoneRegex)) {
                            $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                        } else {
                            $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                        }
                        break;
                    case "box-year-install":
                        if ($(obj).val().trim().match(self.yearRegex)) {
                            $(obj).parent().next().children().children().removeClass("fa-close color-red").addClass("fa-check color-green");
                        } else {
                            $(obj).parent().next().children().children().removeClass("fa-check color-green").addClass("fa-close color-red");
                        }
                        break;
                }
            }
        });
    },
    savesettings: function() {
        var self = this;
        self.checkImputs();
        if (($(".valid-input").length == $(".fa-check").length) ? true : false) {
            var configsshData = {
                boxname: $("#box-name").val(),
                boxSerial: $("#box-name-code").val(),
                macaddess: $("#box-mac").val(),
                boxmodel: $("#box-model").val(),
                boxversion: $("#box-version").val(),
                boxtype: $("#box-type").val(),
                boxlocal: $("#box-local").val(),
                boxlatitude: $("#box-latitude").val(),
                boxlongitude: $("#box-longitude").val(),
                boxclientname: $("#box-client-name").val(),
                boxclientaddress: $("#box-client-address").val(),
                boxclientpostalcode: $("#box-client-postalcode").val(),
                boxclientcity: $("#box-client-city").val(),
                boxclientphone: $("#box-client-phone").val(),
                boxyearinstall: $("#box-year-install").val(),
                localip: $("#local-ip").val(),
                localport: $("#local-port").val(),
                remoteport: $("#remote-port").val(),
                remoteuser: $("#remote-user").val(),
                remoteip: $("#remote-ip").val(),
                sshport: $("#remote-defport").val(),
                privatersa: $("#local-privatekey").val()
            }

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
