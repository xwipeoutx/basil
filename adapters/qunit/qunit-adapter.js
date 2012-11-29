(function(global) {
    var numAssertionsToExpect, currentModule = {}, fixture;
    global.expect = function(val) {return val == null ? numAssertionsToExpect : (numAssertionsToExpect = val)};
    global.module = function(name, args) {
        currentModule = args || {};
    };

    // Not supported
    global.start = function() {};
    global.stop = function() {};
    global.asyncTest = function() {};

    global.test = function(name, expects, fn) {

        if (typeof expects == "function") {
            fn = expects;
            expects = -1;
        }

        var module = currentModule;
        describe(name, function() {
            resetQUnitFixture();

            QUnit.current_testEnvironment = {};
            for (var key in module) {
                QUnit.current_testEnvironment[key] = module[key];
            }
            QUnit.current_testEnvironment.numAsserts = 0;

            if (module.setup) module.setup.call(QUnit.current_testEnvironment);

            expect(expects);

            var oldSetTimeout = global.setTimeout;
            global.setTimeout = function(afterTimeout, i) { afterTimeout(); };
            fn.call(QUnit.current_testEnvironment, QUnit.assert);
            global.setTimeout = oldSetTimeout;

            if (expects > -1)
                equal(expect(), QUnit.current_testEnvironment.numAsserts);

            if (module.teardown) module.teardown.call(QUnit.current_testEnvironment);
        });
    };

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

        fixture = document.getElementById('qunit-fixture');
        previousValue = previousValue || fixture.innerHTML;
        fixture.innerHTML = previousValue;
    }
})(this);