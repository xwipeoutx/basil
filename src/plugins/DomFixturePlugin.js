var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseTestPlugin_1 = require("./BaseTestPlugin");
var DomFixturePlugin = (function (_super) {
    __extends(DomFixturePlugin, _super);
    function DomFixturePlugin() {
        _super.apply(this, arguments);
    }
    DomFixturePlugin.prototype.setup = function (test, go) {
        console.log("setup on " + test.fullKey);
        var domElement = null;
        Object.defineProperty(test.thisValue, 'dom', {
            get: function () {
                if (domElement != null)
                    return domElement;
                domElement = document.createElement('div');
                domElement.setAttribute('id', 'basil-temporary-dom-element');
                domElement.classList.add('basil-temporary-dom-element');
                document.body.appendChild(domElement);
                return domElement;
            }
        });
        go();
        if (domElement)
            document.body.removeChild(domElement);
    };
    return DomFixturePlugin;
})(BaseTestPlugin_1.BaseTestPlugin);
