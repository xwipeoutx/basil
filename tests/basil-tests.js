(function() {
    describe("Context", function() {
        var _ = {};

        var context = new Basil.Context(_, "Constructed name", null);

        then(function() { expect(context.name).to.equal("Constructed name"); });

        then("gets global from constructor", function() {
            expect(context._global).to.equal(_);
        });

        when("no inner tests", function() {
            context.run(testFunction);

            then(function() { expect(context.isComplete()).to.be.true; });

            then(function() { expect(context.passed).to.be.true; });

            when("running a second time", function() {
                then(function() {
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

            then(function() { expect(context.isComplete()).to.be.true; });
            then(function() { expect(context.passed).to.be.true; });

            when("child is added", function() {
                var child = context.children[0];

                then(function() { expect(child.isComplete()).to.be.true; });
                then(function() { expect(child.name).to.equal("Inner Name"); });
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

                then(function() { expect(context.isComplete()).to.be.false; });
                then(function() { expect(context.passed).to.be.undefined; });

                then(function() { expect(firstInnerRunCount).to.equal(1); });
                then(function() { expect(secondInnerRunCount).to.equal(0); });

                var child1 = context.children[0];
                var child2 = context.children[1];
                then("has 2 children, only 1 of which is complete", function() {
                    expect(context.children.length).to.equal(2);
                    expect(child1.isComplete()).to.be.true;
                    expect(child2.isComplete()).to.be.false;
                });

                when("run again", function() {
                    context.run(testFunction);

                    then(function() { expect(context.isComplete()).to.be.true; });
                    then(function() { expect(context.passed).to.be.true; });

                    then(function() { expect(firstInnerRunCount).to.equal(1); });
                    then(function() { expect(secondInnerRunCount).to.equal(1); });
                    then(function() { expect(child2.isComplete()).to.be.true; });
                    then(function() { expect(context.children[1]).to.equal(child2); });
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

                then(function() { expect(context.isComplete()).to.be.true; });

                then(function() { expect(firstInnerRunCount).to.equal(1); });
                then(function() { expect(secondInnerRunCount).to.equal(1); });
                then(function() { expect(thirdInnerRunCount).to.equal(1); });
            });
        });

        when("inner test has no name specified", function() {
            when("function is single-line", function() {
                context.run(function() {
                    _.when(function() {expect(true).to.be.true;});
                });

                then("makes up the name", function() {
                    expect(context.children[0].name).to.equal("expect true to be true");
                });
            });

            when("function is multi-line", function() {
                context.run(function() {
                    _.when(function() {
                        expect(true)
                            .to.be.true;
                    });
                });

                then("makes up the name itself", function() {
                    expect(context.children[0].name).to.equal("expect true to be true");
                });
            });
        })

        when("context throws an exception", function() {
            when("thrown value is an Error", function() {
                context.run(functionToTest);

                then(function() { expect(context.isComplete()).to.be.true; });
                then(function() { expect(context.passed).to.be.false; });
                then(function() { expect(context.error.message).to.equal("Foo"); });
                then(function() { expect(context.failingFunction).to.equal(functionToTest); });

                function functionToTest () {
                    throw new Error("Foo");
                }
            });

            when("thrown value is a primitive", function() {
                context.run(functionToTest);

                then(function() { expect(context.isComplete()).to.be.true; });
                then(function() { expect(context.passed).to.be.false; });
                then("has the primitive put in the Error", function() { expect(context.error.message).to.equal("Foo"); });
                then(function() { expect(context.failingFunction).to.equal(functionToTest); });

                function functionToTest () {
                    throw "Foo";
                }
            });
        });

        when("single inner throws", function() {
            context.run(function() {
                _.when("inner throwing", function() { throw new Error("Foo")});
            });

            then(function() { expect(context.isComplete()).to.be.true; });
            then(function() { expect(context.passed).to.be.false; });
        });

        when("first inner of 2 throws", function() {
            when("run the first time", function() {
                context.run(testFunction);

                then(function() { expect(context.isComplete()).to.be.false; });

                var firstChild = context.children[0];
                then(function() { expect(firstChild.passed).to.be.false; });

                when("run a second time", function() {
                    context.run(testFunction);

                    then(function() { expect(context.isComplete()).to.be.true; });
                    then(function() { expect(context.passed).to.be.false; });

                    var secondChild = context.children[1];
                    then(function() { expect(secondChild.passed).to.be.true; });
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

            then(function() { expect(context.isComplete()).to.be.true; });
            then(function() { expect(context.passed).to.be.false; });

            var firstChild = context.children[0];
            then(function() { expect(firstChild.passed).to.be.true; });

            var secondChild = context.children[1];
            then(function() { expect(secondChild.passed).to.be.false; });

            function testFunction () {
                _.when("inner not throwing", function() { });
                _.when("inner throwing", function() { throw new Error("an Error")});
            }
        });

    });

    var firstDescribeThis;
    describe("running tests", function() {
        var thisForCurrentDescribe = this;
        firstDescribeThis = firstDescribeThis || thisForCurrentDescribe;

        expect(thisForCurrentDescribe).to.not.be.null;

        then(function() { expect(this).to.equal(thisForCurrentDescribe); });
        then(function() { expect(this).to.not.equal(firstDescribeThis); });

    })
})();
