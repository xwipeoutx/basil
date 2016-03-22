var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseTestPlugin_1 = require("./BaseTestPlugin");
var ErrorTextPlugin = (function (_super) {
    __extends(ErrorTextPlugin, _super);
    function ErrorTextPlugin() {
        _super.apply(this, arguments);
    }
    ErrorTextPlugin.prototype.pageRender = function (browserRunner, header, results) {
    };
    ErrorTextPlugin.prototype.testRender = function (testElement, test) {
        if (test.error) {
            var errorElement = appendElement(testElement, 'pre');
            appendText(errorElement, test.error);
        }
    };
    ErrorTextPlugin.prototype.onComplete = function () {
    };
    return ErrorTextPlugin;
})(BaseTestPlugin_1.BaseTestPlugin);
