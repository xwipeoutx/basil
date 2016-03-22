var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseTestPlugin_1 = require("./BaseTestPlugin");
var DisplayTestCountPlugin = (function (_super) {
    __extends(DisplayTestCountPlugin, _super);
    function DisplayTestCountPlugin(browserRunner) {
        _super.call(this);
        this.browserRunner = browserRunner;
    }
    DisplayTestCountPlugin.prototype.setup = function (test, go) {
        go();
        var counts = this.browserRunner.counts;
        this.passed.textContent = counts.passed.toString();
        this.failed.textContent = counts.failed.toString();
        this.total.textContent = counts.total.toString();
        document.title = "[" + counts.passed + '/' + counts.failed + '/' + counts.total + "] " + this.originalTitle;
    };
    DisplayTestCountPlugin.prototype.pageRender = function (browserRunner, header, results) {
        this.originalTitle = document.title;
        var container = document.createElement('div');
        container.id = 'basil-summary';
        header.appendChild(container);
        this.passed = document.createElement('span');
        this.passed.classList.add('basil-passes');
        container.appendChild(this.passed);
        container.appendChild(document.createTextNode('/'));
        this.failed = document.createElement('span');
        this.failed.classList.add('basil-fails');
        container.appendChild(this.failed);
        container.appendChild(document.createTextNode('/'));
        this.total = document.createElement('span');
        this.total.classList.add('basil-total');
        container.appendChild(this.total);
    };
    DisplayTestCountPlugin.prototype.testRender = function (testElement, test) {
    };
    DisplayTestCountPlugin.prototype.onComplete = function () {
    };
    return DisplayTestCountPlugin;
})(BaseTestPlugin_1.BaseTestPlugin);
