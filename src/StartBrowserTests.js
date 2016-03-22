var BrowserRunner_1 = require("./BrowserRunner");
var browser = require("./plugins/browser");
var browserRunner = new BrowserRunner_1.BrowserRunner();
// Capture as early as possible to get around test stubs and such
var browserLocation = document.location;
var realDate = Date;
var localStorage = window.localStorage || {};
var plugins = browser.plugins(browserRunner, browserRunner, function () { return realDate.now(); }, document.location, localStorage);
browserRunner.registerBrowserPlugins(plugins);
var testQueue = [];
var isPolling = false;
function queueTest(name, fn) {
    if (document.body) {
        browserRunner.test(name, fn);
    }
    else {
        testQueue.push({ name: name, fn: fn });
        if (!isPolling) {
            isPolling = true;
            dequeue();
        }
    }
}
function dequeue() {
    if (document.body)
        testQueue.forEach(function (t) { return browserRunner.test(t.name, t.fn); });
    else
        setTimeout(function () { return dequeue(); }, 10);
}
exports.describe = queueTest;
exports.when = queueTest;
exports.then = queueTest;
exports.it = queueTest;
