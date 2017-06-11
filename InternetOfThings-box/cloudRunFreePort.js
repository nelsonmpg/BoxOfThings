var fp = require("find-free-port")
var fs = require("fs");

var port = process.argv.slice(2)[0] || 1000;
var namebox = process.argv.slice(3)[0] || 'BoxIot-9999';
fp(port, function(err, freePort) {
    console.log(JSON.stringify({ port: freePort, namebox: namebox }));
    fs.writeFile('/root/node/receive.txt', JSON.stringify({ port: freePort, namebox: namebox }), 'utf8', function(err) {
        if (err) {
            //               console.log("Erro ao tentar gravar o ficheiro.".red.bold);
        } else {
            //            console.log("O ficheiro de configuração do SSH foi atualizado.".green.bold);
        }
    });

});
