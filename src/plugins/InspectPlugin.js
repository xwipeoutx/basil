var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseTestPlugin_1 = require("./BaseTestPlugin");
var InspectPlugin = (function (_super) {
    __extends(InspectPlugin, _super);
    function InspectPlugin() {
        _super.apply(this, arguments);
    }
    InspectPlugin.prototype.pageRender = function (browserRunner, header, results) {
    };
    InspectPlugin.prototype.testRender = function (testElement, test) {
        if (!test.inspect)
            return;
        var inspectElement = appendElement(testElement, 'i', {
            className: 'basil-icon basil-button icon-signin',
            title: 'Inspect'
        });
        inspectElement.addEventListener('click', function () { return test.inspect(); });
    };
    InspectPlugin.prototype.onComplete = function () {
    };
    return InspectPlugin;
})(BaseTestPlugin_1.BaseTestPlugin);
