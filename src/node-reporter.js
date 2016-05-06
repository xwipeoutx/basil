"use strict";
var col = require("cli-color");
var NodeTestReporter = (function () {
    function NodeTestReporter(testEvents, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this.testEvents = testEvents;
        this.options = options;
        this.numTests = 0;
        this.numPassed = 0;
        this.numFailed = 0;
        this.depths = {};
        this.depth = 1;
        testEvents.leafComplete.subscribe(function (test) {
            _this.numTests++;
            if (test.hasPassed)
                _this.numPassed++;
            else
                _this.numFailed++;
        });
        if (!options.quiet) {
            testEvents.nodeEntered.subscribe(function (test) { return _this.depth++; });
            testEvents.nodeExited.subscribe(function (test) { return _this.depth--; });
            testEvents.rootComplete.subscribe(function (test) { return _this.writeStatus(test, _this.depth); });
        }
    }
    NodeTestReporter.prototype.writeStatus = function (test, depth) {
        var _this = this;
        var color = test.hasPassed ? col.green : col.red;
        var indicator = test.hasPassed ? "√" : "×";
        console.log(color(this.spaces(depth - 1) + indicator + " " + color(test.name)));
        if (!this.options.showTree && test.hasPassed)
            return;
        if (test.error != null && !this.options.hideStack) {
            console.log(this.spaces(depth), col.yellow("> " + test.error.stack));
        }
        test.children.forEach(function (t) { return _this.writeStatus(t, depth + 1); });
    };
    NodeTestReporter.prototype.spaces = function (numSpaces) {
        if (numSpaces == null)
            numSpaces = this.depth;
        return new Array(numSpaces + 1).join("  ");
    };
    Object.defineProperty(NodeTestReporter.prototype, "hasErrors", {
        get: function () { return this.numFailed > 0 || this.numTests == 0; },
        enumerable: true,
        configurable: true
    });
    NodeTestReporter.prototype.writeSummary = function () {
        if (this.options.quiet)
            return;
        console.log();
        if (this.numFailed > 0) {
            console.log(col.red("Test run Failed"));
        }
        else if (this.numTests == 0) {
            console.log(col.yellow("No tests run"));
        }
        else {
            console.log(col.green("Test run Succeeded"));
        }
        var totalText = this.numTests > 0
            ? this.numTests.toString() + " tests"
            : col.yellow("0 tests");
        var passedText = this.numPassed > 0
            ? col.green(this.numPassed.toString() + " passed")
            : col.yellow("0 passed");
        var failedText = this.numFailed > 0
            ? col.red(this.numFailed.toString() + " failed")
            : this.numTests > 0 ? col.green("0 failed") : col.yellow("0 failed");
        console.log(totalText + " | " + passedText + " | " + failedText);
    };
    return NodeTestReporter;
}());
exports.NodeTestReporter = NodeTestReporter;
