var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseTestPlugin_1 = require("./BaseTestPlugin");
var TimingsPlugin = (function (_super) {
    __extends(TimingsPlugin, _super);
    function TimingsPlugin(getMs) {
        _super.call(this);
        this.getMs = getMs;
        this.timings = {};
    }
    TimingsPlugin.prototype.test = function (test, go) {
        var start = this.getMs();
        go();
        var timeSoFar = this.timings[test.fullKey] || 0;
        var inclusiveTime = timeSoFar + Math.floor(this.getMs() - start);
        this.timings[test.fullKey] = inclusiveTime;
    };
    TimingsPlugin.prototype.pageRender = function (browserRunner, header, results) {
    };
    TimingsPlugin.prototype.testRender = function (testElement, test) {
        var timingsElement = document.createElement('span');
        timingsElement.classList.add('basil-test-timing');
        timingsElement.textContent = this.timings[test.fullKey] + 'ms';
        testElement.appendChild(timingsElement);
        addClass(timingsElement, 'basil-test-timing');
    };
    TimingsPlugin.prototype.onComplete = function () {
    };
    return TimingsPlugin;
})(BaseTestPlugin_1.BaseTestPlugin);
