(function(global) {
    function TestRunner () {
        this._plugins = this._plugins.slice();
        this._testQueue = [];
        this._rootTests = [];
        this._started = false;
        this.test = this.test.bind(this);
    }

    TestRunner.prototype = {
        _plugins: [],

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

        _runTest: function(name, fn) {
            if (this._aborted)
                return;

            if (typeof name == "function") {
                fn = name;
                name = this._extractName(fn);
            }

            var test = this._createTest(name);

            if (this._outerTest)
                this._runSingleBranch(test, fn);
            else
                this._runTree(test, fn);

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

        _runTree: function(test, fn) {
            this._rootTests.push(test);
            while (!test.isComplete()) {
                this._branchHasBeenRun = false;
                this._thisValue = {};

                this.runPluginStack(this._runSingleBranch.bind(this, test, fn), 'setup', this._thisValue, [test]);
            }
        },

        _runSingleBranch: function(test, fn) {
            if (test.isComplete() || this._branchHasBeenRun)
                return;

            this.runPluginStack(this._runTestFunction.bind(this, test, fn), 'test', this._thisValue, [test]);

            this._branchHasBeenRun = true;
        },

        runPluginStack: function(innerMostFunction, pluginMethod, context, args) {
            var functions = [innerMostFunction].concat(this._pluginMethods(pluginMethod));

            callback();

            if (functions.length)
                throw new PluginDidNotDelegateError();

            function callback () {
                functions.pop().apply(context, [callback].concat(args));
            }
        },

        runPluginQueue: function (pluginMethod, context, args) {
            this._plugins.forEach(function (plugin) {
                if (pluginMethod in plugin)
                    plugin[pluginMethod].apply(context, args);
            });
        },

        _pluginMethods: function (methodName) {
            return this._plugins
                .map(function (plugin) { return plugin[methodName]; })
                .filter(function (func) { return !!func; });
        },

        _runTestFunction: function(test, fn) {
            if (test.isComplete() || this._branchHasBeenRun)
                return;

            var outerTest = this._outerTest;
            this._outerTest = test;
            test.run(fn, this._thisValue);
            this._outerTest = outerTest;
        },

        tests: function() {
            return this._rootTests;
        },

        registerPlugin: function() {
            for (var i = 0; i < arguments.length; i++)
                this._plugins.push(arguments[i]);
        }
    };

    function Test (name, parent) {
        this._name = name;
        this._parent = parent;
        this._runCount = 0;
        this._children = {};
        this._error = null;
    }

    Test.prototype = {
        name: function() {
            return this._name;
        },

        key: function() {
            return this.name().toLowerCase().replace(/>/g, '');
        },

        fullKey: function() {
            return this._parent
                ? this._parent.fullKey() + '>' + this.key()
                : this.key();
        },

        isComplete: function() {
            return this._skipped
                || this._runCount > 0
                    && this.children().every(function (child) { return child.isComplete(); });
        },

        run: function(fn, thisValue) {
            if (this._skipped)
                return;

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

        skip: function() {
            this._skipped = true;
        },

        wasSkipped: function() {
            return !!this._skipped;
        },

        runCount: function() {
            return this._runCount;
        },

        child: function(name) {
            if (this._children[name])
                return this._children[name];

            return this._children[name] = new Test(name, this);
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

    function PluginDidNotDelegateError () { this.message = "A registered plugin did not delegate"; }

    global.Basil = {
        Test: Test,
        TestRunner: TestRunner
    };
})(this);
