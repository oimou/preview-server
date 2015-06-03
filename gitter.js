"use strict";

var fs = require("fs");
var spawn = require("child_process").spawn;
var exec = require("child_process").exec;
var _ = require("underscore");
var uuid = require("uuid");
var encoder = require("./encoder");

var Gitter = function (param) {
    this.repo = param.repo;
    this.url = "git@bitbucket.org:" + param.repo + ".git";
    this.branch = param.branch;
    this.dest = "/tmp/" + param.repo.replace(/\//g, "-") + "-" + this.branch;
    this.socket = param.socket;
};

Gitter.prototype.sendMessage = function (json) {
    this.socket.send(JSON.stringify(json));
};

Gitter.prototype.start = function () {
    this.clean();
};

Gitter.prototype.clean = function () {
    console.log("CLEAN START: %s", this.dest);

    var self = this;

    exec("rm -rf '" + this.dest + "'", function () {
        console.log("CLEAN FINISHED: %s", self.dest);

        self.sendMessage({
            "type": "progress",
            "value": 1 / 3
        });
        self.clone();
    });
};

Gitter.prototype.clone = function (response) {
    console.log("CLONE START: %s", this.dest);

    var self = this;
    var git = spawn("git", ["clone", "-b", this.branch, this.url, this.dest]);

    git.stdout.on("data", function (chunk) {
        //self.response.write(chunk);
    });

    git.stderr.on("data", function (chunk) {
        //self.response.write(chunk);
    });

    git.on("close", function () {
        console.log("CLONE FINISHED: %s", self.dest);

        self.sendMessage({
            "type": "progress",
            "value": 2 / 3
        });
        self.setup();
    });
};

Gitter.prototype.setup = function () {
    console.log("SETUP START: %s", this.dest);

    var self = this;
    var npm = spawn("npm", ["run", "ci"], {
        cwd: this.dest,
        env: _.extend({}, process.env, {
            BASEURL: "http://52.68.12.189:18080/preview/show/" + encoder.encode(this.repo) + "/" + encoder.encode(this.branch) + "/dist/"
        })
    });

    npm.stdout.on("data", function (chunk) {
        //process.stdout.write(chunk);
    });

    npm.stderr.on("data", function (chunk) {
        //process.stdout.write(chunk);
    });

    npm.on("close", function () {
        console.log("SETUP FINISHED: %s", self.dest);

        self.sendMessage({
            "type": "progress",
            "value": 3 / 3
        });
    });
};

module.exports = Gitter;
