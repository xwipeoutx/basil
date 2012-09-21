var expect = chai.expect;
(function() {

    describe("Context", function() {
        var _ = {};

        var context = new Basil.Context(_, "Test Context", null);

        it("gets name from constructor", function() {
            expect(context.name).to.equal("Test Context");
        });

        when("no inner tests", function() {
            context.run(testFunction);

            it("completed", function() {
                expect(context.isComplete()).to.be.true;
            });

            when("running a second time", function() {
                it("throws an exception", function() {
                    expect(function() {
                        context.run(testFunction)
                    }).to.throw(Basil.TestAlreadyCompleteError);
                });
            });

            function testFunction() {}
        });

        when("1 passing inner test", function() {
            context.run(function() {
                _.when("Inner Name", function() {});
            });

            it("completed", function() {
                expect(context.isComplete()).to.be.true;
            });

            it("has a set up and completed child", function() {
                var child = context.children[0];
                expect(child.isComplete()).to.be.true;
                expect(child.name).to.equal("Inner Name");
            });
        });

        when("2 passing inner tests", function() {
            var firstInnerRunCount = 0,
                secondInnerRunCount = 0;
            var testFunction = function() {
                _.when("First Inner", function() {firstInnerRunCount++});
                _.when("Second Inner", function() {secondInnerRunCount++});
            };

            when("run once", function() {
                context.run(testFunction);

                it("is not completed", function() {
                    expect(context.isComplete()).to.be.false;
                });

                it("ran the first inner test function", function() {
                    expect(firstInnerRunCount).to.equal(1);
                });
                it("did not run the second inner test function", function() {
                    expect(secondInnerRunCount).to.equal(0);
                });

                var child1 = context.children[0];
                var child2 = context.children[1];
                it("has 2 children, only 1 of which is complete", function() {
                    expect(context.children.length).to.equal(2);
                    expect(child1.isComplete()).to.be.true;
                    expect(child2.isComplete()).to.be.false;
                });

                when("run again", function() {
                    context.run(testFunction);

                    it("completed", function() {
                        expect(context.isComplete()).to.be.true;
                    });

                    it("did not rerun the first inner test function", function() {
                        expect(firstInnerRunCount).to.equal(1);
                    });

                    it("ran the second inner test function", function() {
                        expect(secondInnerRunCount).to.equal(1);
                    });

                    it("completed the second inner function", function() {
                        expect(child2.isComplete()).to.be.true;
                    });

                    it("reused the second child context", function() {
                        expect(context.children[1]).to.equal(child2);
                    });
                });
            });
        });

        when("3 passing inner tests", function() {
            var firstInnerRunCount = 0,
                secondInnerRunCount = 0,
                thirdInnerRunCount = 0;
            var testFunction = function() {
                _.when("First Inner", function() {firstInnerRunCount++});
                _.when("Second Inner", function() {secondInnerRunCount++});
                _.when("Third Inner", function() {thirdInnerRunCount++});
            };

            when("running 3 times", function() {
                context.run(testFunction);
                context.run(testFunction);
                context.run(testFunction);

                it("completed", function() {
                   expect(context.isComplete()).to.be.true;
                });

                it("ran the first inner test function once", function() {
                    expect(firstInnerRunCount).to.equal(1);
                });
                it("ran the second inner test function once", function() {
                    expect(secondInnerRunCount).to.equal(1);
                });
                it("ran the third inner test function once", function() {
                    expect(thirdInnerRunCount).to.equal(1);
                });
            });
        });
    });

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