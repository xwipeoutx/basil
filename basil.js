(function(global) {
    function TestRunner () {
        this._rootPlugins = [];
        this._setupPlugins = this._setupPlugins.slice();
        this._testQueue = [];
        this._started = false;
        this.test = this.test.bind(this);
    }

    TestRunner.prototype = {
        _setupPlugins: [],

        test: function(name, fn) {
            if (this._started)
                return this._runTest(name, fn);
            else
                this._testQueue.unshift(this._runTest.bind(this, name, fn));
        },

        start: function() {
            this._started = true;
            this._testQueue.forEach(function(fn) {
                setTimeout(fn, 1);
            });
        },

        abort: function(){
            this._aborted = true;
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

        _runTest: function(name, fn) {
            if (this._aborted)
                return;

            if (typeof name == "function") {
                fn = name;
                name = this._extractName(fn);
            }

            var test = this._createTest(name);

            this._outerTest
                ? this._runSingleBranch(test, fn)
                : this._runTree(test, fn);

            return test;
        },

        _runTree: function(test, fn) {
            while (!test.isComplete()) {
                this._branchHasBeenRun = false;
                this._thisValue = {};

                this._runWithPlugins(this._runSingleBranch.bind(this), this._setupPlugins, this._thisValue)(test, fn);
            }
        },

        _runWithPlugins: function(innerMostFunction, plugins, context) {
            var functions = [innerMostFunction].concat(plugins);

            return callback;

            function callback () {
                var args = Array.prototype.slice.call(arguments);
                functions.pop().apply(context, args.concat(callback));
            }
        },

        _runSingleBranch: function(test, fn) {
            if (!(test instanceof Test))
                throw new InvalidTestError(test);
            if (typeof fn != "function")
                throw new InvalidTestFunctionError(fn);

            if (test.isComplete() || this._branchHasBeenRun)
                return;

            this._runTestFunction(test, fn);

            this._branchHasBeenRun = true;
        },

        _runTestFunction: function(test, fn) {
            var outerTest = this._outerTest;
            this._outerTest = test;
            test.run(fn, this._thisValue);
            this._outerTest = outerTest;
        },

        registerSetupPlugin: function(fn) {
            this._setupPlugins.push(fn);
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

    function InvalidTestError(test) { this.message = test + " is not a Basil.Test"; }

    function InvalidTestFunctionError(fn) { this.message = fn + " is not a function"; }

    global.Basil = {
        Test: Test,
        TestRunner: TestRunner,
        CannotInterceptExistingMethodError: CannotInterceptExistingMethodError,
        InvalidTestError: InvalidTestError,
        InvalidTestFunctionError: InvalidTestFunctionError
    };
})(this);
