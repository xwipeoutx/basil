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

            if (!context.isComplete()) {
                context.run(fn);
                this._isComplete = true;
                this._hasRun = true;
            }
        },

        isComplete: function() {
            return this._isComplete;
        }
    }

    function Context(name, parent) {
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

        run: function(fn) {
            var insideBit = new NestedTest(this._childContext.bind(this));

            var oldFunctions = this._overwriteGlobals(insideBit.execute.bind(insideBit));
            try {
                fn.call(this);
            } finally {
                this._restoreGlobals(oldFunctions);
            }

            this._isComplete = insideBit.isComplete();
        },

        _overwriteGlobals: function(nestFunction) {
            return Basil.nestFunctions.map(function(fnName) {
                var oldFunction = global[fnName];
                global[fnName] = nestFunction.bind(this);

                return {
                    name: fnName,
                    oldFunction: oldFunction
                };
            }, this);
        },

        _restoreGlobals: function(oldFunctions) {
            oldFunctions.forEach(function(fnDef) {
                global[fnDef.name] = fnDef.oldFunction;
            });
        },

        _childContext: function(index, name) {
            var context = this.children[index];
            if (!context) {
                context = new Context(name, this);
                this.children.push(context);
            }
            return context;
        },

        isComplete: function() {
            return this._isComplete;
        }
    };

    var results = [];

    var Basil = global.Basil = {
        InsideBit: NestedTest,
        Context: Context,
        results: results,
        nestFunctions: ['when', 'it']
    };

    global.describe = describe;

    function describe(name, fn) {
        global.describe = null;

        var context = new Context(name, null);
        results.push(context);

        var maxRuns = 73;

        while (maxRuns-- && !context.isComplete())
            context.run(fn);

        if (maxRuns <=0)
            throw "Infinite Loop";

        global.describe = describe;
    }

    function describeWithWait(name, fn) {
        whenReady(function() {
            describe(name, fn);
        });
    }

    function whenReady(fn) {
        if (document.body)
            fn();
        else
            setTimeout(fn, 0);
    }
})(this);