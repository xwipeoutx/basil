var expect = chai.expect;
(function() {

    if (1)
        (function() {
            describe("Nested Test", function() {
                var childContext = {
                    run: function(fn) {
                        this.fn = fn;
                        return this.shouldRunAgain;
                    }};
                var childContextProvider = function(index, name) {
                    return childContext;
                }

                var nestedTest = new Basil.NestedTest(childContextProvider);

                when("no nested functions have been called", function() {
                    it("is complete", function() {
                        expect(nestedTest.isComplete()).to.equal(true);
                    });
                });

                when("single nested function is already complete", function() {
                    childContext.isComplete = true;
                    var innerName = "Nested Name";
                    var innerFunction = function() {}

                    nestedTest.execute(innerName, innerFunction);
                    it("is not complete", function() {
                        expect(nestedTest.isComplete()).to.equal(false);
                    });
                });
            });
            return;

        })();

    return;

    var it1RunCount = 0;
    var describeRunCount = 0;
    describe("it running in isolation", function() {
        var it1HasRun = false;
        var it2HasRun = false;
        describeRunCount++;

        it("it 1", function() {
            it1HasRun = true;
            it1RunCount++;
        });
        expect(it1RunCount).to.equal(1);

        it("it 2", function() {
            it2HasRun = true;
            expect(it1HasRun).to.equal(false);
        });
        expect(it1RunCount).to.equal(1);

        if (describeRunCount == 2)
            expect(it2HasRun).to.equal(true);

    });
    expect(describeRunCount).to.equal(2);

    it1RunCount = 0;
    var describeRunCount = 0
    describe("nesting", function() {
        when("nesting 2", function() {
            var it1HasRun = false;
            var it2HasRun = false;
            describeRunCount++;

            it("it 1", function() {
                it1HasRun = true;
                it1RunCount++;
            });
            expect(it1RunCount).to.equal(1);

            it("it 2", function() {
                it2HasRun = true;
                expect(it1HasRun).to.equal(false);
            });
            expect(it1RunCount).to.equal(1);

            it("it 3", function() {
            });

            when('nesting 3', function() {
                it("foo", function() {

                });
            });
        });
    });

    describe("no implementations", function() {
        it("foo", function() {});
        it("bar", function() {});
        it("baz", function() {});
    });

    describe("context hierarchy", function() {
        var describeContext = this;
        it("should be called the context name", function() {
            expect(describeContext.name).to.equal('context hierarchy');
        });

        it("should have the it name", function() {
            expect(this.name).to.equal('should have the it name');
        });

        it("should have a parent of the context", function() {
            expect(this.parent).to.equal(describeContext);
        });
    });

    describe("Whenaroo", function() {
        when("in a when", function() {
            var whenContext = this;

            expect(whenContext.name).to.equal('in a when');

            when("nested in the when", function() {
                var nestedItRun = false;
                it("rocks", function() {
                    nestedItRun = true;
                });
                expect(nestedItRun).to.equal(true);
            });
        });
    });
})();