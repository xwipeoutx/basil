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

        _handleIntercept: function() {
            this.test.apply(this, arguments);
        },

        test: function() {

        }
    };

    function TestExecutionStatus(name) {
        this._name = name;
        this._isComplete = false;
        this._hasRun = false;
        this._children = {};
    }
    TestExecutionStatus.prototype = {
        name: function() {
            return this._name;
        },
        isComplete: function() {
            return this._hasRun
                && this.children().every(function(child) { return child.isComplete(); });
        },
        run: function(fn) {
            this._hasRun = true;
            fn();
        },
        hasRun: function() {
            return this._hasRun;
        },
        child: function(name) {
            if (this._children[name])
                return this._children[name];

            return this._children[name] = new TestExecutionStatus(name);
        },
        children: function() {
            return Object.keys(this._children)
                .map(function(key) { return this._children[key];}, this);
        }
    };

    function TestAlreadyCompleteError (message) { this.message = message; }
    function CannotInterceptExistingMethodError(message) { this.message = message; }

    var Basil = global.Basil = {
        TestExecutionStatus: TestExecutionStatus,
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
