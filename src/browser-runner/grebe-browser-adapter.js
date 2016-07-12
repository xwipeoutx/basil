window.describe = grebe.test;
window.given = grebe.test;
window.when = grebe.test;
window.then = grebe.test;
window.it = grebe.test;

var ConsoleReporter = (function () {
    function ConsoleReporter(options) {
        if (options === void 0) { options = {}; }
        this.options = options;
        this.numTests = 0;
        this.numPassed = 0;
        this.numFailed = 0;
        this.depths = {};
        this.depth = 1;
    }
    ConsoleReporter.prototype.connect = function (testEvents) {
        var _this = this;
        testEvents.leafComplete.subscribe(function (test) {
            _this.numTests++;
            if (test.hasPassed)
                _this.numPassed++;
            else
                _this.numFailed++;
        });
        testEvents.nodeEntered.subscribe(function (test) { return _this.depth++; });
        testEvents.nodeExited.subscribe(function (test) { return _this.depth--; });
        testEvents.rootComplete.subscribe(function (test) { return _this.writeStatus(test, _this.depth); });
    };
    ConsoleReporter.prototype.writeStatus = function (test, depth) {
        var _this = this;
        var indicator = test.hasPassed ? "/" : "x";
        var method = test.hasPassed ? "info" : "warn";
        console[method]((this.spaces(depth - 1) + indicator + " " + (test.name)));
        if (!this.options.showTree && test.hasPassed)
            return;
        if (test.error != null && !this.options.hideStack) {
            console.info(this.spaces(depth), ("> " + test.error.stack));
        }
        test.children.forEach(function (t) { return _this.writeStatus(t, depth + 1); });
    };
    ConsoleReporter.prototype.spaces = function (numSpaces) {
        if (numSpaces == null)
            numSpaces = this.depth;
        return new Array(numSpaces + 1).join("  ");
    };
    return ConsoleReporter;
}());

new ConsoleReporter({ showTree: true }).connect(grebe.events);