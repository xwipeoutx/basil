'use strict';
(function () {
    var testsRun = false, nonDescribeTestsRun = false;

    describe('BQUnit', function () {

        it('has a simple test name', function () {
            equal("has a simple test name", QUnit.config.current.testName);
        });

        var describeContext = this;
        it("has qunit context for describe", function () {
            // on IE9, QUnit.jsDump.parse will infinite recurse when using strictEqual
            ok(describeContext === QUnit.current_testEnvironment);
        });

        it('runs with qunit context as "this"', function () {
            ok(this === QUnit.current_testEnvironment);
        });

        when('in a "when"', function () {
            it('should run a test', function () {
                ok(true);
                testsRun = true;
            });

            it('should get module from describe', function () {
                equal('BQUnit', QUnit.config.current.module);
            });

            it('should have a hierarchical name', function () {
                equal('when in a "when" it should have a hierarchical name', QUnit.config.current.testName);
            });

            it('should handle conflicting it names', function () {
                equal('when in a "when" it should handle conflicting it names', QUnit.config.current.testName);
            });

            var whenContext = this;
            it('runs with qunit context as "this"', function () {
                ok(whenContext === QUnit.current_testEnvironment);
            });

            when('in another "when"', function () {
                it('should run another test', function () {
                    ok(true);
                });

                it('should use nested names', function () {
                    equal('when in a "when" and in another "when" it should use nested names', QUnit.config.current.testName);
                });

                it('should handle conflicting it names', function () {
                    equal('when in a "when" and in another "when" it should handle conflicting it names', QUnit.config.current.testName);
                });
            });

            it('should no longer have the nested when name', function () {
                equal('when in a "when" it should no longer have the nested when name', QUnit.config.current.testName);
            });
        });

        when('the "when" has setup and teardown code', function () {
            var setupCodeRun = true;
            var inBetweenCode = false;

            it('ran setup code before the "it" call', function () {
                ok(setupCodeRun);
            });

            it('did not run code after the "it" call', function () {
                ok(!inBetweenCode);
            });

            inBetweenCode = true;
            it('ran code before a second "it" call', function () {
                ok(inBetweenCode);
            });
        });
    });

    var state;
    module("BQUnit", {
        setup: function () {
            state = {
                isSetup: true
            };
        },
        teardown: function () {
            state = undefined;
        }
    });

    when("not in a describe", function () {
        it("still runs tests", function () {
            nonDescribeTestsRun = true;
            ok(true);
        });

        it("has a nested name", function () {
            equal('when not in a describe it has a nested name', QUnit.config.current.testName);
        });

        var isSetUpDuringWhen = state.isSetup;
        it("module was set up", function () {
            ok(state.isSetup);
            ok(isSetUpDuringWhen);
        });

        when("nesting", function () {
            it("has a nested name", function () {
                equal('when not in a describe and nesting it has a nested name', QUnit.config.current.testName);
            });
        });
    });

    test("Z it ran tests", function () {
        // 'Z' is there for qunit reordering stuff
        ok(testsRun, "describe tests ran");
        ok(nonDescribeTestsRun, "non-describe tests ran");
    });

    var stubMethod = false;
    describe("BQUnit - sinon", function() {
        when("capturing tests", function() {
            if (stubMethod === false)
                stubMethod = this.stub;

            it("has a stub method (from sinon)", function() {
                equal('function', typeof stubMethod);
            });
        });
    });
})();
