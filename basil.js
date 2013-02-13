(function(global) {
    function NestedTest (childContextProvider) {
        this._childContextProvider = childContextProvider;

        this._childContextIndex = 0;
        this._hasRun = false;
        this._isComplete = true;
    }

    NestedTest.prototype = {
        execute: function(name, fn, scope) {
            var context = this._childContextProvider(this._childContextIndex, name);
            this._childContextIndex++;

            if (this._hasRun) {
                this._isComplete = false;
                return;
            }

            if (context.isComplete())
                return;

            context.run(fn, scope);
            this._hasRun = true;

            if (!context.isComplete()) {
                this._isComplete = false;
            }
        },

        isComplete: function() {
            return this._isComplete;
        }
    }

    function Context (global, name, parent) {
        this._global = global;
        this.name = name;
        this.parent = parent;
        this.children = [];
        this._isComplete = false;
    }

    Context.prototype = {
        parents: function() {
            if (!this.parent)
                return [];

            return this.parent.parents().concat(this.parent);
        },

        isComplete: function() { return this._isComplete;},

        fullName: function() {
            return this.name + ' ' + (this.parent ? this.parent.fullName() : '');
        },

        run: function(fn, scope) {
            if (this._isComplete)
                throw new TestAlreadyCompleteError("Cannot run a complete test");

            var nestedTest = new NestedTest(this._childContext.bind(this));

            var self = this;
            var oldFunctions = this._overwriteGlobals(function(name, fn) {
                if (typeof name == "function") {
                    fn = name;
                    name = this._extractPartNameFromFunction(fn);
                }
                nestedTest.currentContext = self;
                nestedTest.execute(name, fn, scope);
            });

            try {
                fn.call(scope);
            } catch (error) {
                this._captureError(error, fn, scope);
            } finally {
                this._restoreGlobals(oldFunctions);
            }

            this._isComplete = nestedTest.isComplete();
            if (this._isComplete)
                this.passed = this.passed !== false && this.children.every(function(c) { return c.passed; });
        },

        _extractPartNameFromFunction: function(fn) {
            var fnContents = fn.toString();

            fnContents = /function.+\{([\s\S]+)\}\w*$/.exec(fnContents)[1];
            if (fnContents == null)
                return "(No Name)";

            return fnContents.replace(/\W+/gi, ' ').trim();
        },

        _captureError: function(error, fn, scope) {
            if (!(error instanceof Error))
                error = new Error(error);

            this.passed = false;
            this.error = error;
            this.failingFunction = fn;
            this.failingScope = scope;
        },

        _overwriteGlobals: function(nestFunction) {
            return Basil.nestFunctions.map(function(fnName) {
                var oldFunction = this._global[fnName];
                this._global[fnName] = nestFunction.bind(this);

                return {
                    name: fnName,
                    oldFunction: oldFunction
                };
            }, this);
        },

        _restoreGlobals: function(oldFunctions) {
            oldFunctions.forEach(function(fnDef) {
                this._global[fnDef.name] = fnDef.oldFunction;
            }, this);
        },

        _childContext: function(index, name) {
            var context = this.children[index];
            if (!context) {
                context = new Context(this._global, name, this);
                this.children.push(context);
            }
            return context;
        },

        clean: function() {
            delete this._global;
            delete this._isComplete;
            this.children.forEach(function(child) { child.clean(); });
        }
    };

    function TestRunner (global) {
        this._global = global;
        this._intercepted = [];
    }

    TestRunner.prototype = {
        intercept: function(methodName) {
            if (this._global[methodName])
                throw new CannotInterceptExistingMethodError(methodName);

            this._global[methodName] = this._handleIntercept.bind(this);
            this._intercepted.push(methodName);
        },

        restore: function() {
            this._intercepted.forEach(function(methodName) {
                delete this._global[methodName];
            }, this);
            this._intercepted.length = 0;
        },

        _handleIntercept: function(name, fn) {
            this.test(name, fn);
        },

        test: function(name, fn) {
            return this._outerTest
                ? this._runChild(name, fn)
                : this._runRoot(name, fn);
        },

        _runRoot: function(name, fn) {
            var test = new Test(name);

            while(!test.isComplete()) {
                this._shouldStop = false;
                this._testPass(test, fn);
            }

            return test;
        },

        _runChild: function(name, fn) {
            var test = this._outerTest.child(name);
            this._testPass(test, fn);
            return test;
        },

        _testPass: function(test, fn) {
            if (test.isComplete() || this._shouldStop)
                return test;

            this._runTestFunction(test, fn);

            if (test.isComplete())
                this._shouldStop = true;

            return test;
        },

        _runTestFunction: function(test, fn) {
            var outerTest = this._outerTest;
            this._outerTest = test;
            test.run(fn);
            this._outerTest = outerTest;
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

        run: function(fn) {
            try {
                fn();
            } catch(error) {
                if (!(error instanceof Error))
                    error = new Error(error);
                this._error = error;
                this.inspect = fn;
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
            return this.isComplete() && this._error == null;
        },

        error: function() {
            return this._error;
        }
    };

    function TestAlreadyCompleteError (message) { this.message = message; }

    function CannotInterceptExistingMethodError (message) { this.message = message; }

    var Basil = global.Basil = {
        Test: Test,
        TestRunner: TestRunner,
        NestedTest: NestedTest,
        Context: Context,
        TestAlreadyCompleteError: TestAlreadyCompleteError,
        nestFunctions: ['when', 'then', 'it']
    };

    global.describe = describe;

    function describe (name, fn) {
        var oldDescribe = global.describe;
        global.describe = null;

        var context = new Basil.Context(global, name, null);

        while (!context.isComplete()) {
            var scope = {
                basilFullContext: this
            };

            context.run(fn, scope);
        }
        context.clean();

        global.describe = oldDescribe;
        return context;
    }
})(this);
