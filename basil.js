(function(global) {
    function NestedTest(childContextProvider) {
        this._childContextProvider = childContextProvider;

        this._childContextIndex = 0;
        this._hasRun = false;
        this._isComplete = true;
    }

    NestedTest.prototype = {
        execute: function(name, fn) {
            var context = this._childContextProvider(this._childContextIndex, name);
            this._childContextIndex++;

            if (this._hasRun) {
                this._isComplete = false;
                return;
            }

            if (context.isComplete())
                return;

            context.run(fn);
            this._hasRun = true;

            if (!context.isComplete()) {
                this._isComplete = false;
            }
        },

        isComplete: function() {
            return this._isComplete;
        }
    }

    function Context(global, name, parent) {
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

        run: function(fn) {
            if (this._isComplete)
                throw new TestAlreadyCompleteError("Cannot run a complete test");

            var insideBit = new NestedTest(this._childContext.bind(this));

            var oldFunctions = this._overwriteGlobals(insideBit.execute.bind(insideBit));
            try {
                fn.call(this);
            } catch(ex) {
                this.passed = false;
            } finally {
                this._restoreGlobals(oldFunctions);
            }

            this._isComplete = insideBit.isComplete();
            if (this._isComplete)
                this.passed = this.passed !== false && this.children.every(function(c) { return c.passed; });
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
        }
    };

    function TestAlreadyCompleteError(message) { this.message = message; }

    var results = [];

    var Basil = global.Basil = {
        NestedTest: NestedTest,
        Context: Context,
        TestAlreadyCompleteError: TestAlreadyCompleteError,
        results: results,
        nestFunctions: ['when', 'it']
    };

    global.describe = describe;

    function describe(name, fn) {
        global.describe = null;

        var context = new Context(global, name, null);
        results.push(context);

        var maxRuns = 73;

        while (maxRuns && !context.isComplete()) {
            context.run(fn);
            maxRuns--;
        }

        if (maxRuns <= 0)
            throw "Infinite Loop";

        global.describe = describe;
    }
})(this);
