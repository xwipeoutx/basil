(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.grebe = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var TestRunner = (function () {
    function TestRunner(events) {
        this.events = events;
        this._testQueue = [];
        this._rootTests = [];
        this._aborted = false;
        this._outerTest = null;
        this._leafTest = null;
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
        var test = this._outerTest
            ? this._outerTest.child(name)
            : new Test(name, null);
        if (!test.isDiscovered) {
            test.isDiscovered = true;
            this.events.nodeFound.next(test);
        }
        return test;
    };
    TestRunner.prototype._startRun = function (test, testFunction) {
        this._rootTests.push(test);
        this.events.rootStarted.next(test);
        while (!test.isComplete) {
            this._leafTest = null;
            this._continueRun(test, testFunction);
            this.events.leafComplete.next(this._leafTest);
        }
        this.events.rootComplete.next(test);
    };
    TestRunner.prototype._continueRun = function (test, testFunction) {
        if (test.isComplete || this._leafTest != null)
            return;
        this._runTestFunction(test, testFunction);
    };
    TestRunner.prototype._runTestFunction = function (test, testFunction) {
        var outerTest = this._outerTest;
        this._outerTest = test;
        this.events.nodeEntered.next(test);
        test.run(testFunction);
        this.events.nodeExited.next(test);
        this._outerTest = outerTest;
        if (test.isComplete && !test.children.length && !test.wasSkipped)
            this._leafTest = test;
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
    return TestRunner;
}());
exports.TestRunner = TestRunner;
var Test = (function () {
    function Test(_name, _parent) {
        this._name = _name;
        this._parent = _parent;
        this._runCount = 0;
        this._error = null;
        this._skipped = false;
        this._isComplete = false;
        this._inspect = null;
        this.isDiscovered = false;
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
            fn();
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
    Test.prototype.hasChild = function (name) {
        return !!this._children[name];
    };
    Test.prototype.child = function (name) {
        if (this.hasChild(name))
            return this._children[name];
        return this._children[name] = new Test(name, this);
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
        this._inspect(); // Step into this
    };
    Object.defineProperty(Test.prototype, "code", {
        get: function () {
            return this._inspect ? this._inspect.toString() : null;
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

},{}],2:[function(require,module,exports){
(function (global){
"use strict";
var runner_1 = require("./runner");
function getInstance() {
    var top = global;
    if (top.__glebeGlobals)
        return top.__glebeGlobals;
    var events = new runner_1.TestEvents();
    var testRunner = new runner_1.TestRunner(events);
    top.__glebeGlobals = {
        events: events,
        testRunner: testRunner
    };
    return top.__glebeGlobals;
}
exports.glebeSingleton = getInstance();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./runner":1}],3:[function(require,module,exports){
"use strict";
var singleton_1 = require("./singleton");
exports.events = singleton_1.glebeSingleton.events;
exports.testRunner = singleton_1.glebeSingleton.testRunner;
function test(name, fn) {
    exports.testRunner.runTest(name, fn);
}
exports.test = test;
exports.describe = test;
exports.given = test;
exports.when = test;
exports.then = test;
exports.it = test;

},{"./singleton":2}]},{},[3])(3)
});