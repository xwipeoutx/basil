(function() {
    describe("running in proper timing", function() {
        if (!document.body)
            notNull(document.body, "Document not ready!");
    });

    setTimeout(function() {
        var it1RunCount = 0;

        describe("it running in isolation", function() {
            var it1HasRun = false;
            var it2HasRun = false;

            it("it 1", function() {
                it1HasRun = true;
                it1RunCount++;
            });
            equal(it1RunCount, 1);

            it("it 2", function() {
                it2HasRun = true;
            });
            equal(it1RunCount, 1);
            isTrue(it1HasRun != it2HasRun);
        });

        describe("it running in isolation", function() {
            it("foo", function() {});
            it("bar", function() {});
            it("baz", function() {});
        });

    describe("context hierarchy", function() {
        var describeContext = this;
        it("should be called the context name", function() {
            equal(describeContext.name, 'context hierarchy');
        });

        it("should have the it name", function() {
            equal(this.name, "should have the it name");
        });

        it("should have a parent of the context", function() {
            equal(this.parent, describeContext);
        });
    });

    describe("Whenaroo", function() {
        when("in a when", function() {
            var whenContext = this;
            equal(whenContext.name, "in a when");

            it("is cool", function() {

            });

            when("nested in the when", function() {
                it("rocks", function() {

                });
            });

            it("rockszors", function() {

            });
        });
    });


}, 100);
})
();

//tfsbad do gooder
function equal(actual, expected) {
    if (expected != actual)
        fail("Expected: '" + expected + "' but got: '" + actual + "'");
}

function notNull(obj) {
    if (obj == null)
        fail("Value should not be null");
}

function isTrue(val) {
    if (!val)
        fail("Value should have been true");
}

function isFalse(val) {
    if (val)
        fail("Value should have been false");
}

function fail(msg) {
    try {
        throw new Error();
    } catch (e) {
        throw msg + "\n" + e.stack.split("\n")[3];
    }
}