const path = require("path");
const bodyParser = require('body-parser');
const fs = require('fs');
const port = 80;
const express = require('express');
const httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});
var app = express();

proxy.on('error', function(e) {
    console.log(e);
});

fs.readFile('proxy.conf.json', (err, data) => {
    if (err) throw err;
    var config = JSON.parse(data);

    //console.log(config);

    Object.keys(config).forEach(addr => {
        console.log("Setting proxy --> " + addr, '--> '+  config[addr].target);

        app.all(addr, (req, res) => {
            let arr = req.url.split('/');
            arr.splice(0, 2);

            req.url = '/' + arr.join('/');

            console.log(req.url);

            proxy.web(req, res, {
                
                target: config[addr].target,
                https: true,
                changeOrigin: true
              });
        })
    });

    app.use(express.static(__dirname+'/dist/project-mgr2'));
    app.get('*', function(req, res) {
      res.sendFile(path.join(__dirname+'/dist/project-mgr2/index.html'));
    });

    const server = app.listen(port, () => {
        console.log("project-mgr2 --> listening at: " + port)
    });

    const io = require('socket.io')(server);

    io.on('connection', (socket) => {
        console.log('a user connected');
    });
});