(function() {
    describe("Context", function() {
        var _ = {};

        var context = new Basil.Context(_, "Test Context", null);

        it("gets name from constructor", function() {
            expect(context.name).to.equal("Test Context");
        });

        it("gets global from constructor", function() {
            expect(context._global).to.equal(_);
        });

        when("no inner tests", function() {
            context.run(testFunction);

            it("completed", function() {
                expect(context.isComplete()).to.be.true;
            });

            it("passed", function() {
                expect(context.passed).to.be.true;
            });

            when("running a second time", function() {
                it("throws an exception", function() {
                    expect(function() {
                        context.run(testFunction)
                    }).to.throw(Basil.TestAlreadyCompleteError);
                });
            });

            function testFunction () {}
        });

        when("1 passing inner test", function() {
            context.run(function() {
                _.when("Inner Name", function() {});
            });

            it("completed", function() {
                expect(context.isComplete()).to.be.true;
            });

            it("passed", function() {
                expect(context.passed).to.be.true;
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
                it("does not know if passed", function() {
                    expect(context.passed).to.be.undefined;
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

                    it("passed", function() {
                        expect(context.passed).to.be.true;
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
                _.when("First Inner", function() {firstInnerRunCount++;});
                _.when("Second Inner", function() {secondInnerRunCount++;});
                _.when("Third Inner", function() {thirdInnerRunCount++;});
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

        when("context throws an exception", function() {
            when("thrown value is an Error", function() {
                context.run(testFunction);

                it("is complete", function() {
                    expect(context.isComplete()).to.be.true;
                });

                it("does not pass", function() {
                    expect(context.passed).to.be.false;
                });

                it("has error details", function() {
                    expect(context.error.message).to.equal("Foo");
                });

                it("holds on to test function", function() {
                    expect(context.failingFunction).to.equal(testFunction);
                });

                function testFunction () {
                    throw new Error("Foo");
                }
            });


            when("thrown value is a primitive", function() {
                context.run(testFunction);

                it("is complete", function() {
                    expect(context.isComplete()).to.be.true;
                });

                it("does not pass", function() {
                    expect(context.passed).to.be.false;
                });

                it("has error details", function() {
                    expect(context.error.message).to.equal("Foo");
                });

                it("holds on to test function", function() {
                    expect(context.failingFunction).to.equal(testFunction);
                });

                function testFunction () {
                    throw "Foo";
                }
            });
        });


        when("single inner throws", function() {
            context.run(function() {
                _.when("inner throwing", function() { throw new Error("Foo")});
            });

            it("is complete", function() {
                expect(context.isComplete()).to.be.true;
            });

            it("does not pass", function() {
                expect(context.passed).to.be.false;
            });
        });

        when("first inner of 2 throws", function() {
            when("run the first time", function() {
                context.run(testFunction);

                it("is not complete", function() {
                    expect(context.isComplete()).to.be.false;
                });

                it("has a non passing child", function() {
                    expect(context.children[0].passed).to.be.false;
                });

                when("run a second time", function() {
                    context.run(testFunction);

                    it("is complete", function() {
                        expect(context.isComplete()).to.be.true;
                    });

                    it("has not passed", function() {
                        expect(context.passed).to.be.false;
                    });

                    it("has a passing child", function() {
                        expect(context.children[1].passed).to.be.true;
                    });
                });
            });
            function testFunction () {
                _.when("inner throwing", function() { expect(true).to.be.false; });
                _.when("inner not throwing", function() { });
            }
        });

        when("second inner of 2 throws", function() {
            context.run(testFunction);
            context.run(testFunction);

            it("is complete", function() {
                expect(context.isComplete()).to.be.true;
            });

            it("has not passed", function() {
                expect(context.passed).to.be.false;
            });

            it("has a passing first child", function() {
                expect(context.children[0].passed).to.be.true;
            });

            it("has a failing second child", function() {
                expect(context.children[1].passed).to.be.false;
            });

            function testFunction () {
                _.when("inner not throwing", function() { });
                _.when("inner throwing", function() { throw new Error("an Error")});
            }
        });

    });

    var firstDescribeThis;
    describe("running tests", function() {
        var describeThis = this;
        firstDescribeThis = firstDescribeThis || describeThis;

        expect(describeThis).to.not.be.null;

        it("uses same this in nesting", function() {
            expect(this).to.equal(describeThis);
        });

        it("uses a different this in a second nesting", function() {
            expect(this).to.not.equal(firstDescribeThis);
        });

    })
})();
