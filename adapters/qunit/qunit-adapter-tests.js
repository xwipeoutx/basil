test("module without setup/teardown (default)", function() {
    expect(1);
    ok(true);
});

test("expect in test", 3, function() {
    ok(true);
    ok(true);
    ok(true);
});

test("expect in test", 1, function() {
    ok(true);
});

test("expect query and multiple issue", function() {
    expect(2);
    ok(true);
    var expected = expect();
    equal(expected, 2);
    expect(expected + 1);
    ok(true);
});

QUnit.module("assertion helpers");

QUnit.test( "QUnit.assert compatibility", 5, function( assert ) {
    assert.ok( true, "Calling method on `assert` argument to test() callback" );

    // Should also work, although discouraged and not documented
    QUnit.assert.ok( true, "Calling method on QUnit.assert object" );

    // Test compatibility aliases
    QUnit.ok( true, "Calling aliased method in QUnit root object" );
    ok( true, "Calling aliased function in global namespace" );

    // Regression fix for #341
    // The assert-context way of testing discouraged global variables,
    // it doesn't make sense of it itself to be a global variable.
    // Only allows for mistakes (e.g. forgetting to list 'assert' as parameter)
    assert.notStrictEqual( window.assert, QUnit.assert, "Assert does not get exposed as a global variable" );
});

module("setup test", {
    setup: function() {
        ok(true);
    }
});

test("module with setup", function() {
    expect(2);
    ok(true);
});

test("module with setup, expect in test call", 2, function() {
    ok(true);
});

var state;

module("setup/teardown test", {
    setup: function() {
        state = true;
        ok(true);
        // Assert that we can introduce and delete globals in setup/teardown
        // without noglobals sounding any alarm.

        // Using an implied global variable instead of explicit window property
        // because there is no way to delete a window.property in IE6-8
        // `delete x` only works for `x = 1, and `delete window.x` throws exception.
        // No one-code fits all solution possible afaic. Resort to @cc.

        /*@cc_on
         @if (@_jscript_version < 9)
         x = 1;
         @else @*/
        window.x = 1;
        /*@end
         @*/
    },
    teardown: function() {
        ok(true);

        /*@cc_on
         @if (@_jscript_version < 9)
         delete x;
         @else @*/
        delete window.x;
        /*@end
         @*/
    }
});

test("module with setup/teardown", function() {
    expect(3);
    ok(true);
});

module("setup/teardown test 2");

test("module without setup/teardown", function() {
    expect(1);
    ok(true);
});

var orgDate;

module("Date test", {
    setup: function() {
        orgDate = Date;
        window.Date = function () {
            ok( false, 'QUnit should internally be independant from Date-related manipulation and testing' );
            return new orgDate();
        };
    },
    teardown: function() {
        window.Date = orgDate;
    }
});

test("sample test for Date test", function () {
    expect(1);
    ok(true);
});

if (typeof setTimeout !== 'undefined') {
    state = 'fail';

    module("teardown and stop", {
        teardown: function() {
            equal(state, "done", "Test teardown.");
        }
    });

    test("teardown must be called after test ended", function() {
        expect(1);
        stop();
        state = "done";
    });
}