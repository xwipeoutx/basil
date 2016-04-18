"use strict";
var nodeRunner = require("./src/basilNode");
var glob = require("glob");
nodeRunner.hookNodeListeners();
glob("test/**/*.js", {
    realPath: true
}, function (err, files) {
    files.forEach(function (f) { return require('./' + f); });
    nodeRunner.writeSummary();
    if (nodeRunner.hasErrors()) {
        process.exit(2);
    }
    else {
        process.exit(0);
    }
});
