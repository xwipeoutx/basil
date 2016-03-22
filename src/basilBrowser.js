"use strict";
var basil_1 = require("./basil");
var browser = require("./plugins/browser");
var browserRunner = new basil_1.TestRunner(null);
// Capture as early as possible to get around test stubs and such
var browserLocation = document.location;
var realDate = Date;
var localStorage = window.localStorage || {};
var plugins = browser.plugins(browserRunner, function () { return realDate.now(); }, document.location, localStorage);
//browserRunner.registerBrowserPlugins(plugins);
var testQueue = [];
var isPolling = false;
var queueTest = function (name, fn) {
    if (document.body) {
    }
    else {
        testQueue.push({ name: name, fn: fn });
        if (!isPolling) {
            isPolling = true;
            dequeue();
        }
    }
};
function dequeue() {
    if (document.body)
        //testQueue.forEach(t => browserRunner.test(t.name, t.fn));
        //else
        setTimeout(function () { return dequeue(); }, 10);
}
exports.describe = queueTest;
exports.when = queueTest;
exports.then = queueTest;
exports.it = queueTest;
exports.test = queueTest;
