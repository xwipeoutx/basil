var BaseTestPlugin = (function () {
    function BaseTestPlugin() {
    }
    BaseTestPlugin.prototype.setup = function (test, go) {
        go();
    };
    BaseTestPlugin.prototype.test = function (test, go) {
        go();
    };
    BaseTestPlugin.prototype.pageRender = function (browserRunner, header, results) {
    };
    BaseTestPlugin.prototype.testRender = function (testElement, test) {
    };
    BaseTestPlugin.prototype.onComplete = function () {
    };
    return BaseTestPlugin;
})();
exports.BaseTestPlugin = BaseTestPlugin;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BaseTestPlugin;
