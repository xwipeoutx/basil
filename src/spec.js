"use strict";
var runner_1 = require("./runner");
function getGlebeSingleton() {
    var top = global;
    if (top.__glebeGlobals)
        return top.__glebeGlobals;
    var events = new runner_1.TestEvents();
    var testRunner = new runner_1.TestRunner(events);
    top.__glebeGlobals = {
        events: events,
        testRunner: testRunner
    };
    return top.__glebeGlobals;
}
var glebeSingleton = getGlebeSingleton();
exports.events = glebeSingleton.events;
exports.testRunner = glebeSingleton.testRunner;
function test(name, fn) {
    exports.testRunner.runTest(name, fn);
}
exports.test = test;
exports.describe = test;
exports.given = test;
exports.when = test;
exports.then = test;
exports.it = test;
