var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseTestPlugin_1 = require("./BaseTestPlugin");
var TestCountPlugin = (function (_super) {
    __extends(TestCountPlugin, _super);
    function TestCountPlugin(testRunner) {
        _super.call(this);
        this.testRunner = testRunner;
    }
    TestCountPlugin.prototype.setup = function (test, go) {
        go();
        if (test.isComplete)
            this.countLeaves(test);
    };
    TestCountPlugin.prototype.countLeaves = function (innerTest) {
        var _this = this;
        var children = innerTest.children;
        if (children.length) {
            children.forEach(function (t) { return _this.countLeaves(t); });
        }
        else if (!innerTest.wasSkipped) {
            this.testRunner.counts.total++;
            if (innerTest.hasPassed)
                this.testRunner.counts.passed++;
            else
                this.testRunner.counts.failed++;
        }
    };
    return TestCountPlugin;
})(BaseTestPlugin_1.BaseTestPlugin);
