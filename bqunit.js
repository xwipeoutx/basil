"use strict";
(function (global) {
    function describe(describeName, describeFunction) {
        module(describeName);

        whileBlockingErrors('Describe: ' + describeName, function () {
            executeTests(describeFunction);
        });
    }

    function whenRoot(whenName, whenFunction) {
        var dummyDescribeFunction = function () {
            when(whenName, whenFunction);
        };

        var testEnvironment = QUnit.config.currentModuleTestEnviroment || {};

        if(typeof (testEnvironment.setup) == "function")
            testEnvironment.setup();

        executeTests(dummyDescribeFunction);

        if(typeof (testEnvironment.teardown) == "function")
            testEnvironment.teardown();
    }

    function executeTests(rootFunction) {
        var context = captureTests(rootFunction, null, {});
        runContext(context, rootFunction, []);
    }

    function captureTests(fn, contextName, thisObj) {
        var context = newContext(contextName);
        overrideGlobalsAndCall(when, it, fn, thisObj);
        return context;

        function when(whenName, whenFunction) {
            whileBlockingErrors('When: ' + whenName, capture);

            function capture() {
                context.whens.push(captureTests(whenFunction, whenName, thisObj));
            }
        }

        function it(itName, itFunction) {
            context.its.push(itName);
        }
    }

    function whileBlockingErrors(contextName, callback) {
        if (QUnit.urlParams["notrycatch"]) {
            callback.call(this);
            return;
        }

        try {
            callback.call(this);
        } catch (ex) {
            test("Failed SETUP (" + contextName + ")", function () {
                notOk(true, "SETUP Failed: " + ex.toString());
            });
        }
    }

    function runContext(context, describeFunction, whenNames) {
        context.its.forEach(function (itName) {
            runTest(whenNames, itName);
        });

        context.whens.forEach(function (whenContext) {
            runContext(whenContext, describeFunction, whenNames.concat(whenContext.name));
        });

        function runTest(whenPaths, itName) {
            var testName = whenPaths.length
                ? "when " + whenPaths.join(' and ') + ' it ' + itName
                : itName;

            test(testName, function () {
                overrideGlobalsAndCall(when, it, describeFunction, QUnit.current_testEnvironment);
            });

            function when(attemptedWhenName, whenFunction) {
                if (whenPaths[0] != attemptedWhenName)
                    return;

                whenPaths = whenPaths.slice(1);
                whenFunction.call(QUnit.current_testEnvironment);
            }

            function it(attemptedItName, itFunction) {
                if (whenPaths.length == 0 && itName == attemptedItName)
                    itFunction.call(QUnit.current_testEnvironment);
            }
        }
    }

    function overrideGlobalsAndCall(when, it, fn, thisObj) {
        var oldWhen = global.when;
        var oldIt = global.it;
        global.when = when;
        global.it = it;
        try {
            if (thisObj)
                fn.call(thisObj);
            else
                fn();
        } finally {
            global.when = oldWhen;
            global.it = oldIt;
        }
    }

    function newContext(whenName) {
        return {
            name: whenName,
            whens: [],
            its: []
        };
    }

    global.describe = describe;
    global.when = whenRoot;
})(this);

// Sinon support
(function(global) {
    var oldDescribe = global.describe;
    var oldWhen = global.when;

    function describe(describeName, describeFunction)
    {
        var fn = sinon.test(describeFunction);
        oldDescribe(describeName, fn);
    }

    function when(whenname, whenFunction) {
        var fn = sinon.test(whenFunction);
        oldWhen(whenname, fn);
    }

    global.describe = describe;
    global.when = when;
})(this);