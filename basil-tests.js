var expect = chai.expect;
(function() {
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

    });
    expect(describeRunCount).to.equal(2);

    it1RunCount = 0;
    var describeRunCount = 0
    describe("nesting", function() {
        when("execute", function() {
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
        });
    });

    describe("it running in isolation", function() {
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