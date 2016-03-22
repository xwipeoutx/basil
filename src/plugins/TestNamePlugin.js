var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseTestPlugin_1 = require("./BaseTestPlugin");
var TestNamePlugin = (function (_super) {
    __extends(TestNamePlugin, _super);
    function TestNamePlugin() {
        _super.apply(this, arguments);
    }
    TestNamePlugin.prototype.pageRender = function (browserRunner, header, results) {
    };
    TestNamePlugin.prototype.testRender = function (testElement, test) {
        appendText(testElement, test.name);
    };
    TestNamePlugin.prototype.onComplete = function () {
    };
    return TestNamePlugin;
})(BaseTestPlugin_1.BaseTestPlugin);
