(function(global) {
    var numAssertionsToExpect, currentModule={};
    global.expect = function(val) {return val == null ? numAssertionsToExpect : (numAssertionsToExpect = val)};
    global.module = function(name, args) {
        currentModule = args || {};
    };
    global.start = function() {};
    global.stop = function() {};

    global.test = function(name, expects, fn) {
        var module = currentModule;
        describe(name, function() {
            if (typeof expects == "function") {
                fn = expects;
                expects = -1;
            }

            QUnit.current = {
                numAsserts: 0
            };

            if (module.setup) module.setup();

            //it(name, function() {
                expect(expects);
                fn(QUnit.assert);
                if (expects > -1)
                equal(expect(), QUnit.current.numAsserts);
            //});

            if (module.teardown) module.teardown();
        });
    };

    global.QUnit = {
        expect: global.expect,
        module: global.module,
        test: global.test
    };
})(this);