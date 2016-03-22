var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseTestPlugin_1 = require("./BaseTestPlugin");
var ViewCodePlugin = (function (_super) {
    __extends(ViewCodePlugin, _super);
    function ViewCodePlugin() {
        _super.apply(this, arguments);
    }
    ViewCodePlugin.prototype.pageRender = function (browserRunner, header, results) {
    };
    ViewCodePlugin.prototype.testRender = function (testElement, test) {
        if (!test.code)
            return;
        var codeIcon = appendElement(testElement, 'i', {
            className: 'basil-icon basil-button icon-code',
            title: 'View Code'
        });
        var code = appendElement(testElement, 'code', {
            innerHTML: test.code.toString().trim(),
            className: 'basil-code'
        });
        var isVisible = false;
        codeIcon.addEventListener('click', function () {
            isVisible = !isVisible;
            code.className = isVisible
                ? 'basil-code is-basil-code-visible'
                : 'basil-code';
        });
    };
    ViewCodePlugin.prototype.onComplete = function () {
    };
    return ViewCodePlugin;
})(BaseTestPlugin_1.BaseTestPlugin);
