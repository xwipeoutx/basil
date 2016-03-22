"use strict";
var PluginDidNotDelegateError = (function () {
    function PluginDidNotDelegateError() {
        this.message = "A registered plugin did not delegate";
    }
    return PluginDidNotDelegateError;
}());
exports.PluginDidNotDelegateError = PluginDidNotDelegateError;
var TestRunner = (function () {
    function TestRunner(events) {
        this.events = events;
        this._plugins = [];
        this._testQueue = [];
        this._rootTests = [];
        this._aborted = false;
        this._outerTest = null;
        this._branchHasBeenRun = false;
        this.leaves = [];
        this.passed = [];
        this.failed = [];
    }
    TestRunner.prototype.abort = function () {
        this._aborted = true;
    };
    TestRunner.prototype.runTest = function (name, fn) {
        if (this._aborted)
            return null;
        var test = this._createTest(name);
        if (this._outerTest)
            this._continueRun(test, fn);
        else
            this._startRun(test, fn);
        return test;
    };
    TestRunner.prototype._createTest = function (name) {
        return this._outerTest
            ? this._outerTest.child(name)
            : new Test(name, null, {});
    };
    TestRunner.prototype._startRun = function (test, testFunction) {
        this._rootTests.push(test);
        this.events.rootStarted.next(test);
        while (!test.isComplete) {
            this._branchHasBeenRun = false;
            this._continueRun(test, testFunction);
        }
        this.events.rootComplete.next(test);
    };
    TestRunner.prototype._continueRun = function (test, testFunction) {
        if (test.isComplete || this._branchHasBeenRun) {
            return;
        }
        for (var i = 0; i < 200000000; i++)
            i = i + 1 - 1;
        this._runTestFunction(test, testFunction);
        this._branchHasBeenRun = true;
    };
    TestRunner.prototype.runStack = function (onComplete, runPlugin) {
        var pluginsRun = [];
        var pluginsCopy = this._plugins.slice(0);
        var allPluginsRan = false;
        runNextPlugin();
        if (!allPluginsRan)
            throw new PluginDidNotDelegateError();
        function runNextPlugin() {
            if (pluginsCopy.length > 0) {
                var plugin = pluginsCopy.pop();
                pluginsRun.push(plugin);
                runPlugin(plugin, runNextPlugin);
            }
            else {
                onComplete();
                allPluginsRan = true;
            }
        }
    };
    TestRunner.prototype._runTestFunction = function (test, testFunction) {
        if (test.isComplete || this._branchHasBeenRun)
            return;
        if (test.runCount == 0)
            this.events.nodeFound.next(test);
        var outerTest = this._outerTest;
        this._outerTest = test;
        this.events.nodeEntered.next(test);
        test.run(testFunction);
        this.events.nodeExited.next(test);
        if (test.isComplete && !test.children.length && !test.wasSkipped)
            this.recordCompletion(test);
        this._outerTest = outerTest;
    };
    TestRunner.prototype.recordCompletion = function (test) {
        this.events.leafComplete.next(test);
        this.leaves.push(test);
        if (test.hasPassed)
            this.passed.push(test);
        else
            this.failed.push(test);
    };
    Object.defineProperty(TestRunner.prototype, "tests", {
        get: function () {
            return this._rootTests;
        },
        enumerable: true,
        configurable: true
    });
    TestRunner.prototype.registerPlugin = function () {
        var plugins = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            plugins[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < plugins.length; i++)
            this._plugins.push(plugins[i]);
    };
    return TestRunner;
}());
exports.TestRunner = TestRunner;
var Test = (function () {
    function Test(_name, _parent, _context) {
        this._name = _name;
        this._parent = _parent;
        this._context = _context;
        this._runCount = 0;
        this._error = null;
        this._skipped = false;
        this._isComplete = false;
        this._inspect = null;
        this._inspectContext = null;
        this._children = {};
    }
    Object.defineProperty(Test.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Test.prototype, "key", {
        get: function () {
            return this._name.toLowerCase().replace(/>/g, '');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Test.prototype, "fullKey", {
        get: function () {
            return this._parent
                ? this._parent.fullKey + '>' + this.key
                : this.key;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Test.prototype, "isComplete", {
        get: function () {
            return this._skipped
                || this._isComplete
                || (this._isComplete = this._runCount > 0
                    && this.children.every(function (child) { return child.isComplete; }));
        },
        enumerable: true,
        configurable: true
    });
    Test.prototype.run = function (fn) {
        if (this._skipped)
            return;
        try {
            fn.call(this._context);
        }
        catch (error) {
            if (!(error instanceof Error))
                error = new Error(error);
            this._error = error;
            this._inspect = fn;
        }
        this._runCount++;
    };
    Test.prototype.skip = function () {
        this._skipped = true;
    };
    Object.defineProperty(Test.prototype, "wasSkipped", {
        get: function () {
            return this._skipped;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Test.prototype, "runCount", {
        get: function () {
            return this._runCount;
        },
        enumerable: true,
        configurable: true
    });
    Test.prototype.child = function (name) {
        if (this._children[name])
            return this._children[name];
        return this._children[name] = new Test(name, this, {});
    };
    Object.defineProperty(Test.prototype, "children", {
        get: function () {
            var _this = this;
            return Object.keys(this._children)
                .map(function (key) { return _this._children[key]; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Test.prototype, "hasPassed", {
        get: function () {
            return this.isComplete
                && this.children.every(function (child) { return child.hasPassed; })
                && this._error == null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Test.prototype, "error", {
        get: function () {
            return this._error;
        },
        enumerable: true,
        configurable: true
    });
    Test.prototype.inspect = function () {
        debugger;
        this._inspect(this._context); // Step into this
    };
    Object.defineProperty(Test.prototype, "code", {
        get: function () {
            return this._inspect ? this._inspect.toString() : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Test.prototype, "thisValue", {
        get: function () {
            return this._context;
        },
        enumerable: true,
        configurable: true
    });
    return Test;
}());
exports.Test = Test;
var EventStream = (function () {
    function EventStream() {
        this.callbacks = [];
    }
    EventStream.prototype.subscribe = function (callback) {
        this.callbacks.push(callback);
    };
    EventStream.prototype.next = function (event) {
        this.callbacks.forEach(function (cb) { return cb(event); });
    };
    return EventStream;
}());
exports.EventStream = EventStream;
var TestEvents = (function () {
    function TestEvents() {
        this.rootStarted = new EventStream();
        this.rootComplete = new EventStream();
        this.nodeFound = new EventStream();
        this.nodeEntered = new EventStream();
        this.nodeExited = new EventStream();
        this.leafComplete = new EventStream();
    }
    return TestEvents;
}());
exports.TestEvents = TestEvents;
exports.events = new TestEvents();
exports.testRunner = new TestRunner(exports.events);
function test(name, fn) {
    exports.testRunner.runTest(name, fn);
}
exports.test = test;
exports.describe = test;
exports.when = test;
exports.then = test;
exports.it = test;
