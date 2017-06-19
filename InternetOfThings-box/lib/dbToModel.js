/* global module */
var mongoose = require('mongoose'),
    htmlparser = require('htmlparser2'),
    cheerio = require('cheerio'),
    User = require('./models/user.js'),
    Addr = require('./models/addr.js'),
    Neighbor = require('./models/neighbor.js'),
    Route = require('./models/route.js'),
    connectDB = require('./models/connectDB.js'),
    coapCalls = require('./coapCalls.js'),
    ini = require('ini'),
    fs = require('fs'),
    md5 = require('md5'),
    btoa = require('btoa'),
    log = require('./serverlog.js');

User = new User();
Addr = new Addr();
Neighbor = new Neighbor();
Route = new Route();

module.exports = {
    configDB: function(cfg) {
        var self = this;
        connectDB.connectDB(cfg);
        User.InsertUser({
            email: cfg.user,
            pass: md5(btoa(cfg.pass))
        }, null);

        self.removeOldRecords();
    },

    removeOldRecords: function() {
        Addr.removeAllRecords();
        Neighbor.removeAllRecords();
        Route.removeAllRecords();
    },

    loginUser: function(req, res) {
        var params = { email: req.body.email, pass: req.body.pass };
        User.loginUser(params, res);
    },

    insertUser: function(req, res) {
        User.InsertUser({
            email: "admin@admin.pt",
            pass: req.body.pass
        }, res);
    },

    insertAddr: function(data) {
        Addr.insertData(data);
    },

    insertNeighbor: function(data) {
        Neighbor.insertData(data);
    },

    insertRoute: function(data) {
        Route.insertData(data);
    },

    getAllAdressDistinct: function(req, res) {
        Route.getAllAdressDistinct(res);
    },

    readFile: function(file) {
        var self = this;
        fs.readFile(file, 'utf8', function(err, data) {
            if (err) {
                return console.log(err);
            }
            self.parseHtml(data);
        });
    },

    parseHtml: function(response) {
        var self = this;
        //Variables
        var arr = new Array();
        //Number of properties
        var mult = 0;
        //READ HTML
        var $ = cheerio.load(response);

        //H2 - Principal Titles
        $('h2').each(function(i, element) {
            //3 Properties
            mult = 3;
            var h2 = $(this);
            var pre = h2.next();
            var preReplaced = "";

            //Retirar algumas tags
            preReplaced = pre.toString().replace(/(\r\n|\r|\n)/g, " ").replace("<pre>", "").replace("</pre>", "");
            //Passar para array
            arr = preReplaced.split(" ");
            //Retirar posições do array que não importam
            for (var i = arr.length - 1; i >= 0; i--) {
                if (arr[i].toString().includes("[<a") || arr[i].toString().includes("href") || arr[i].toString() === "") {
                    arr.splice(i, 1);
                }
            }

            if (h2.text() == "Addresses") {
                for (var i = 0; i < arr.length / mult; i++) {
                    self.insertAddr({ address: arr[i * mult], firstLetter: arr[i * mult + 1], secondLetter: arr[i * mult + 2] });
                }

            } else if (h2.text() == "Neighbors") {
                //3 Properties
                mult = 3;

                for (var i = 0; i < arr.length / mult; i++) {
                    self.insertNeighbor({ address: arr[i * mult], from: arr[i * mult + 1], status: arr[i * mult + 2] });
                }

            } else if (h2.text() == "Routes") {
                mult = 3;

                //Caso tenha alguma das tags a baixo, sai fora do array
                for (var i = arr.length - 1; i >= 0; i--) {
                    if (arr[i].toString() === "s" || arr[i].toString().includes("via")) {
                        arr.splice(i, 1);
                    }
                }

                for (var i = 0; i < arr.length / mult; i++) {
                    self.insertRoute({ address: "[" + arr[i * mult].splt("/")[0] + "]", from: arr[i * mult + 1], time: arr[i * mult + 2] });
                }
            }

        });
        setTimeout(function() {
            coapCalls.getValuesFromSensors();
        }, 3000);

    }
};

// Create Base64 Object
var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function(e) {
        var t = "";
        var n, r, i, s, o, u, a;
        var f = 0;
        e = Base64._utf8_encode(e);
        while (f < e.length) {
            n = e.charCodeAt(f++);
            r = e.charCodeAt(f++);
            i = e.charCodeAt(f++);
            s = n >> 2;
            o = (n & 3) << 4 | r >> 4;
            u = (r & 15) << 2 | i >> 6;
            a = i & 63;
            if (isNaN(r)) {
                u = a = 64;
            } else if (isNaN(i)) {
                a = 64;
            }
            t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a);
        }
        return t;
    },
    decode: function(e) {
        var t = "";
        var n, r, i;
        var s, o, u, a;
        var f = 0;
        e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (f < e.length) {
            s = this._keyStr.indexOf(e.charAt(f++));
            o = this._keyStr.indexOf(e.charAt(f++));
            u = this._keyStr.indexOf(e.charAt(f++));
            a = this._keyStr.indexOf(e.charAt(f++));
            n = s << 2 | o >> 4;
            r = (o & 15) << 4 | u >> 2;
            i = (u & 3) << 6 | a;
            t = t + String.fromCharCode(n);
            if (u != 64) {
                t = t + String.fromCharCode(r);
            }
            if (a != 64) {
                t = t + String.fromCharCode(i);
            }
        }
        t = Base64._utf8_decode(t);
        return t;
    },
    _utf8_encode: function(e) {
        e = e.replace(/\r\n/g, "\n");
        var t = "";
        for (var n = 0; n < e.length; n++) {
            var r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
            } else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128);
            } else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128);
            }
        }
        return t;
    },
    _utf8_decode: function(e) {
        var t = "";
        var n = 0;
        var r = c1 = c2 = 0;
        while (n < e.length) {
            r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
                n++;
            } else if (r > 191 && r < 224) {
                c2 = e.charCodeAt(n + 1);
                t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                n += 2;
            } else {
                c2 = e.charCodeAt(n + 1);
                c3 = e.charCodeAt(n + 2);
                t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                n += 3;
            }
        }
        return t;
    }
};
