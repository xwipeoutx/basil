(function(global) {
    var numAssertionsToExpect;
    global.expect = function(val) {return val == null ? numAssertionsToExpect : (numAssertionsToExpect = val)};

    // Not supported
    global.start = function() {};
    global.stop = function() {};
    global.asyncTest = function() {};

    var currentModuleName = "no context supplied";
    var testsToRun = {
        "no context supplied": {
            tests: []
        }
    };

    global.module = function(name, options) {
        var current = testsToRun[name] || (testsToRun[name] = {
            tests: []
        });
        current.context = options || {};
        currentModuleName = name;
    }

    var executeTimeoutId = false;

    global.test = function (name, numExpects, testFunction) {
        if (typeof numExpects == "function") {
            testFunction = numExpects;
            numExpects = null;
        }
        var module = testsToRun[currentModuleName];
        module.tests.push({
            name: name,
            numExpects: numExpects,
            testFunction: testFunction
        })

        if (executeTimeoutId)
            clearTimeout(executeTimeoutId);

        // FIXME: Slightly risky, if a script takes more than 100ms to download, and it shares a module name.
        // So not that risky in practice
        executeTimeoutId = setTimeout(function () {
            executeTimeoutId = null;
            executeAll();
        }, 100);
    };

    global.when = function (name, fn) {
        test(name, fn);
    };

    function executeAll () {
        for (var moduleName in testsToRun) {
            var module = testsToRun[moduleName];

            describe(moduleName, function() {
                for (var i = 0; i < module.tests.length; i++) {
                    var test = module.tests[i];
                    run(test.name, test.numExpects, test.testFunction, module.context);
                }
            });
        }
    }

    function run (testName, numExpects, testFunction, testEnvironmentBase) {
        resetQUnitFixture();

        var context = QUnit.current_testEnvironment = {};
        for (var key in testEnvironmentBase) {
            context[key] = testEnvironmentBase[key];
        }
        context.numAsserts = 0;

        var oldSetTimeout = global.setTimeout;
        global.setTimeout = function(callInstantly, i) { callInstantly(); };
        runSetupAndTest();
        global.setTimeout = oldSetTimeout;

        function runSetupAndTest () {
            if (context.setup || context.teardown) {
                when("module setup/teardown", function() {
                    if (context.setup) context.setup();
                    runQUnitTest();
                    if (context.teardown) context.teardown();
                });
            } else {
                runQUnitTest()
            }
        }

        function runQUnitTest () {
            it(testName, function() {
                expect(numExpects);

                testFunction.call(context, QUnit.assert);

                if (numExpects != null)
                    equal(expect(), context.numAsserts);
            });
        }
    }

    global.QUnit = {
        expect: global.expect,
        module: global.module,
        test: global.test,
        equiv: function() {
            QUnit.push(false, false, false, '"QUnit.equiv" not supported for Basil\'s QUnit Adapter');
        },
        done: function() {},
        jsDump: {
            parse: function() { QUnit.push(false, false, false, '"QUnit.jsDump" not supported for Basil\'s QUnit Adapter');}
        }
    };

    var previousValue = null;

    function resetQUnitFixture () {
        if (!document.body)
            return;

        var fixture = document.getElementById('qunit-fixture');
        previousValue = previousValue || fixture.innerHTML;
        fixture.innerHTML = previousValue;
    }
})(this);