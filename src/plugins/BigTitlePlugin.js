var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseTestPlugin_1 = require("./BaseTestPlugin");
var BigTitlePlugin = (function (_super) {
    __extends(BigTitlePlugin, _super);
    function BigTitlePlugin(location) {
        _super.call(this);
        this.location = location;
    }
    BigTitlePlugin.prototype.pageRender = function (browserRunner, header, results) {
        var title = document.createElement('a');
        title.href = this.location.href.replace(location.search, '');
        title.textContent = document.title || 'Basil';
        title.id = 'basil-title';
        header.appendChild(title);
    };
    BigTitlePlugin.prototype.testRender = function (testElement, test) {
    };
    BigTitlePlugin.prototype.onComplete = function () {
    };
    return BigTitlePlugin;
})(BaseTestPlugin_1.BaseTestPlugin);
