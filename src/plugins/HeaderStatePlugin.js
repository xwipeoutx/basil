var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseTestPlugin_1 = require("./BaseTestPlugin");
var HeaderStatePlugin = (function (_super) {
    __extends(HeaderStatePlugin, _super);
    function HeaderStatePlugin(testRunner) {
        _super.call(this);
        this.testRunner = testRunner;
    }
    HeaderStatePlugin.prototype.pageRender = function (browserRunner, header, results) {
        this.headerElement = header;
        addClass(header, 'is-running');
    };
    HeaderStatePlugin.prototype.testRender = function (testElement, test) {
    };
    HeaderStatePlugin.prototype.onComplete = function () {
        removeClass(this.headerElement, 'is-running');
        if (this.testRunner.counts.failed)
            addClass(this.headerElement, 'is-failed');
    };
    return HeaderStatePlugin;
})(BaseTestPlugin_1.BaseTestPlugin);
