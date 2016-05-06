"use strict";
var spec_1 = require("./spec");
var node_reporter_1 = require("./node-reporter");
var glob = require("glob");
var testFiles = [];
var reporterOptions = {};
function test(globs) {
    var globsArray = (typeof globs == "string") ? [globs] : globs;
    var globOptions = {
        realpath: true
    };
    var initial = [];
    testFiles = globsArray.reduce(function (result, pattern) { return result.concat(glob.sync(pattern, globOptions)); }, testFiles);
}
exports.test = test;
function options(value) {
    reporterOptions = value;
}
exports.options = options;
function run(globs, reporterOptions) {
    var reporter = new node_reporter_1.NodeTestReporter(spec_1.events, reporterOptions);
    testFiles.forEach(function (f) {
        require(f);
    });
    reporter.writeSummary();
    if (reporter.hasErrors) {
        process.exit(2);
    }
    else {
        process.exit(0);
    }
}
exports.run = run;
