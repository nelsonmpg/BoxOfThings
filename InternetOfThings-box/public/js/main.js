/* global Backbone, _, templateLoader, app */

Backbone.View.prototype.close = function () {
    this.remove();
    this.unbind();
    this.undelegateEvents();
};

// Configuracao das varias rotas de navegacao no site
var Router = Backbone.Router.extend({
    currentView: undefined,
    header: undefined,
    sidebar: undefined,
    contentheader: undefined,
    contentnav: undefined,
    content: undefined,
    footer: undefined,
    configform: undefined,
    configbox: undefined,
    loginform: undefined,
    about: undefined,
    socketclt: null,
    terminalcmd: undefined,
    initialize: function () {
        var self = this;
        self.appEventBus = _.extend({}, Backbone.Events);
        self.socketclt = new socketClient({vent: self.appEventBus});

        // update dos graficos em realtime
        self.appEventBus.on("updateRealTimeChart", function (data, local, site) {
            console.log("Event");
        });
        self.appEventBus.on('stdout', function (data) {
            self.terminalcmd.terminalstdout(data);
        });
        self.appEventBus.on('stderr', function (data) {
            self.terminalcmd.terminalstderr(data);
        });
        self.appEventBus.on('disconnect', function () {
            self.terminalcmd.terminaldisconnect();
        });
        self.appEventBus.on('enable', function () {
            self.terminalcmd.terminalenable();
        });
        self.appEventBus.on('disable', function () {
            self.terminalcmd.terminaldisable();
        });
        self.appEventBus.on('prompt', function (data) {
            self.terminalcmd.terminalsetprompt(data);
        });

    },
    showView: function (view, elem, sub) {
        elem.show();
        if (sub == false) {
            if (this.currentView) {
                this.currentView.close();
            }
            this.currentView = view;
            this.currentView.delegateEvents();
        }
        var rendered = view.render();
        elem.html(rendered.el);
    },
    // defenicao de navegacao nas rotas
    routes: {
        //Default Page
        "": "login",
        //Pagina Inicial
        "Inicio": "inicio",
        "ConfigBox": "boxconfig",
        "ConfigSite": "configsite",
        "Terminal": "cmdterminal",
        "About": "aCercaDe",
        '*notFound': 'login'
    },
    login: function () {
        this.currentView = undefined;
        this.header = undefined;
        this.sidebar = undefined;
        this.contentheader = undefined;
        this.contentnav = undefined;
        this.content = undefined;
        this.footer = undefined;
        this.configform= undefined;
        this.configbox= undefined;
        this.loginform = undefined;
        this.terminalcmd = undefined;
        if (this.socketclt) {
         this.socketclt.disconnect();
     }

// limpa todo o conteudo das varias View da pagina web
$('header').html("");
$('#content').html("");
$('aside.main-sidebar').html("");
$('footer').html("");
$('contentnav').html("");

//elimina o conteudo do profile
window.profile = null;
window.sessionStorage.clear();
window.logged = false;

var self = this;
self.loginform = new LoginView({});
$('#content').html(self.loginform.render().el);
self.loginform.checkloginstored();
},
aCercaDe: function () {
    var self = this;
    self.verificaLogin(function () {
        self.about = new AboutView();
        self.contentnav.setView("About");
        $('#content').html(self.about.render().el);
        windowScrollTop();
    });
},
inicio: function () {
    var self = this;
    self.verificaLogin(function () {
     self.socketclt.connect();
     self.header = new HeaderView({
        logo: (window.profile.logo == "") ? "./img/user.png" : window.profile.logo
    });

     self.content = new InicioView();
     self.sidebar = new SideBarView({});
     self.footer = new FooterView();
     self.contentnav = new ContentNavView();

     $('header').html(self.header.render().el);
     self.header.init();

     $('#contentnav').html(self.contentnav.render().el);
     self.contentnav.setView("Inicio");

     $('#content').html(self.content.render().el);

     $('aside.main-sidebar').html(self.sidebar.render().el);

     $('footer').html(self.footer.render().el);
     self.footer.init();
 });
},
boxconfig : function (){
    var self = this;
    self.verificaLogin(function () {
        self.configbox = new ConfigBoxView({});
        $('#content').html(self.configbox.render().el);
        self.configbox.init();
        self.contentnav.setView("Config Box");
    });
},
    // carrega as configuracoes do site
    configsite: function () {
        var self = this;
        self.verificaLogin(function () {
            self.configform = new ConfigSiteView({});
            $('#content').html(self.configform.render().el);
            self.configform.init();
            self.contentnav.setView("Config Site");
        });
    },
    cmdterminal: function () {
        var self = this;
        self.verificaLogin(function () {
            self.contentnav.setView("Terminal");
            self.terminalcmd = new TerminalView({socket: self.socketclt});
            $('#content').html(self.terminalcmd.render().el);
            self.terminalcmd.init();
        });
    },
    // verifica se o login e valido
    verificaLogin: function (loggedFunction) {
        var self = this;
        if (window.profile == undefined) {
            app.navigate('', {
                trigger: true
            });
        } else {
            if (!getKeyo()) {
                app.navigate('', {
                    trigger: true
                });
            } else {
                window.logged = true;
                loggedFunction();
            }
        }
    }
});

/**
 * Faz o load dos varios templates do BackBone
 * @param {type} param1
 * @param {type} param2
 */
 templateLoader.load([
    "LoginView",
    "HeaderView",
    "InicioView",
    "SideBarView",
    "FooterView",
    "ConfigBoxView",
    "ConfigSiteView",
    "ContentNavView",
    "TerminalView",
    "AboutView"],
    function () {
        app = new Router();
        Backbone.history.start();
    }
    );