(function(global) {
    function Context(name, parent) {
        this.name = name;
        this.parent = parent;
        this.children = [];
        this._lastCompletedIndex = -1;
    }

    Context.prototype = {
        parents: function() {
            if (!this.parent)
                return [];

            return this.parent.parents().concat(this.parent);
        },

        run: function(fn) {
            var shouldRunAgain = false;
            var somethingHasRunThisRound = false;
            var processIndex = 0;

            var oldIt = global.it;
            var oldWhen = global.when;
            global.it = it.bind(this);
            global.when = when.bind(this);

            fn.call(this);

            global.it = oldIt;
            global.when = oldWhen;

            return shouldRunAgain;

            function it(name, runFn) {
                var context = this._childContext(processIndex++, name);
                process.call(this, context, runFn);
            }

            function when(name, runFn) {
                var context = this._childContext(processIndex++, name);
                process.call(this, context, runFn);
            }


            function process(context, runFn) {
                var alreadyProcessedCurrent = processIndex <= this._lastCompletedIndex;
                if (alreadyProcessedCurrent)
                    return;

                if (somethingHasRunThisRound) {
                    shouldRunAgain = true;
                } else {
                    shouldRunAgain = context.run(runFn);
                    if (!shouldRunAgain) {
                        this._lastCompletedIndex = processIndex;
                    }
                }

                somethingHasRunThisRound = true;
            }
        },

        _childContext: function(index, name) {
            var context = this.children[index];
            if (!context) {
                context = new Context(name, this);
                this.children.push(context);
            }
            return context;
        }
    };


    var results = [];

    var JSHUnit = global.JSHUnit = {
        results: results
    };

    global.describe = describeWithWait;

    function describe(name, fn) {
        global.describe = null;

        var context = new Context(name, null);
        results.push(context);

        while(context.run(fn))
            ;

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