(function(global) {
    function Interceptor (global, callback) {
        this._global = global;
        this._callback = callback;
        this._intercepted = [];
        this._isPaused = false;
        this._interceptQueue = [];
    }

    Interceptor.prototype = {
        intercept: function(methodName) {
            if (this._global[methodName])
                throw new Basil.CannotInterceptExistingMethodError(methodName);

            this._global[methodName] = this._handleIntercept.bind(this);
            this._intercepted.push(methodName);
        },

        restore: function() {
            this._intercepted.forEach(function(methodName) {
                delete this._global[methodName];
            }, this);
            this._intercepted.length = 0;
        },

        _handleIntercept: function(variableArgs) {
            var args = arguments;
            if (!this._isPaused)
                this._callback.apply(this, args);
            else {
                this._interceptQueue.push((function() { this._callback.apply(this, args); }).bind(this));
            }
        },

        pause: function() {
            this._isPaused = true;
        },

        resume: function() {
            this._isPaused = false;

            this._interceptQueue.forEach(function(fn) {fn();});
            this._interceptQueue.length = 0;
        }
    };

    function TestRunner () {
        this._notifyRootCompleted = [];
    }

    TestRunner.prototype = {
        test: function(name, fn) {
            if (typeof name == "function") {
                fn = name;
                name = this._extractName(fn);
            }
            var test = this._createTest(name);

            this._runTest(test, fn);

            return test;
        },

        _extractName: function(fn) {
            if (fn.name)
                return fn.name;

            var fnContents = fn.toString();

            fnContents = /function.+\{([\s\S]+)\}\w*$/.exec(fnContents)[1];
            if (fnContents == null)
                return "(No Name)";

            return fnContents.replace(/\W+/gi, ' ').trim();
        },

        _createTest: function(name) {
            return this._outerTest
                ? this._outerTest.child(name)
                : new Test(name);
        },

        _runTest: function(test, fn) {
            this._outerTest
                ? this._runOnce(test, fn)
                : this._runUntilComplete(test, fn);
        },

        _runUntilComplete: function(test, fn) {
            while (!test.isComplete()) {
                this._shouldStop = false;
                this._thisValue = {};
                this._runOnce(test, fn);
            }

            this._notifyRootCompleted.forEach(function(fn) { fn(test); });
        },

        _runOnce: function(test, fn) {
            if (test.isComplete() || this._shouldStop)
                return;

            this._runTestFunction(test, fn);

            if (test.isComplete())
                this._shouldStop = true;
        },

        _runTestFunction: function(test, fn) {
            var outerTest = this._outerTest;
            this._outerTest = test;
            test.run(fn, this._thisValue);
            this._outerTest = outerTest;
        },

        onRootTestCompleted: function(fn) {
            this._notifyRootCompleted.push(fn);
        }
    };

    function Test (name) {
        this._name = name;
        this._runCount = 0;
        this._children = {};
        this._error = null;
    }

    Test.prototype = {
        name: function() {
            return this._name;
        },

        isComplete: function() {
            return this._runCount > 0
                && this.children().every(function(child) { return child.isComplete(); });
        },

        run: function(fn, thisValue) {
            try {
                fn.call(thisValue);
            } catch (error) {
                if (!(error instanceof Error))
                    error = new Error(error);
                this._error = error;
                this.inspect = fn;
                this.inspectThisValue = thisValue;
            }
            this._runCount++;
        },

        runCount: function() {
            return this._runCount;
        },

        child: function(name) {
            if (this._children[name])
                return this._children[name];

            return this._children[name] = new Test(name);
        },

        children: function() {
            return Object.keys(this._children)
                .map(function(key) { return this._children[key];}, this);
        },

        hasPassed: function() {
            return this.isComplete()
                && this.children().every(function(childTest) { return childTest.hasPassed(); })
                && this._error == null;
        },

        error: function() {
            return this._error;
        }
    };

    function CannotInterceptExistingMethodError (message) { this.message = message; }

    global.Basil = {
        Test: Test,
        TestRunner: TestRunner,
        Interceptor: Interceptor,
        CannotInterceptExistingMethodError: CannotInterceptExistingMethodError
    };
})(this);
