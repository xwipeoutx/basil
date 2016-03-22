var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseTestPlugin_1 = require("./BaseTestPlugin");
var PassedFailIconPlugin = (function (_super) {
    __extends(PassedFailIconPlugin, _super);
    function PassedFailIconPlugin() {
        _super.apply(this, arguments);
    }
    PassedFailIconPlugin.prototype.pageRender = function (browserRunner, header, results) {
    };
    PassedFailIconPlugin.prototype.testRender = function (testElement, test) {
        var icon = appendElement(testElement, 'i');
        icon.classList.add('basil-icon');
        icon.classList.add(test.hasPassed ? 'icon-ok' : 'icon-remove');
    };
    PassedFailIconPlugin.prototype.onComplete = function () {
    };
    return PassedFailIconPlugin;
})(BaseTestPlugin_1.BaseTestPlugin);
