"use strict";

var express = require('express');
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var Gitter = require("./gitter");
var encoder = require("./encoder");

var app = express();
var expressWs = require('express-ws')(app);
var router = express.Router();

app.use(bodyParser());

app.ws('/preview/request', function (ws, req) {
    ws.on('message', function (message) {
        message = JSON.parse(message);

        if (message.type !== 'preview-request') {
            return ws.close();
        }

        var repo = message.repo;
        var branch = message.branch
        var gitter = new Gitter({
            repo: repo,
            branch: branch,
            socket: ws
        });

        gitter.start();
    });
});

app.use('/preview/show/:repo/:branch', function (req, res, next) {
    var param = req.params;
    var repo = encoder.decode(param.repo);
    var branch = encoder.decode(param.branch);
    var dir = "/tmp/" + repo.replace(/\//g, "-") + "-" + branch;

    res.setHeader("Access-Control-Allow-Origin", "*");

    req.dir = dir;

    router(req, res, next);
});

router.get('*', function (req, res, next) {
    var serve = serveStatic(req.dir);

    serve(req, res, next);
});

app.listen(18080);
