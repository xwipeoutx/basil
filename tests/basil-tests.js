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
        });

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

    describe("TestRunner", function() {
        var global = {};
        var sut = new Basil.TestRunner(global);

        if (0)
            when("intercepting calls to someMethod", function() {
                sut.intercept('someMethod');
                this.spy(sut, 'test');

                then(function() { expect(global.someMethod).to.be.a('function');})

                when("restoring method", function() {
                    sut.restore();

                    then(function() { expect(global.someMethod).to.be.undefined; });
                });

                when("calling intercepted method", function() {
                    when("with no arguments", function() {
                        global.someMethod();
                        then(function() { expect(sut.test).to.have.been.calledWith();});
                        then(function() { expect(sut.test).to.have.been.calledOn(sut);});
                    });

                    when("with arguments", function() {
                        global.someMethod('foo', 'bar');
                        then(function() { expect(sut.test).to.have.been.calledWith('foo', 'bar');});
                    });
                });
            });

        if (0)
            when("intercepting calls to an existing method", function() {
                global.existingMethod = function() {};

                then('throws an error', function() {
                    expect(function() {
                        sut.intercept('existingMethod');
                    }).to.throw(Basil.CannotInterceptExistingMethodError);
                });
            });

        when("running empty test method", function() {
            var result = sut.test("TestName", function() {});

            then(function() { expect(result.isComplete()).to.be.true; });
            then(function() { expect(result.runCount()).to.equal(1); });

            when("running another empty test method", function() {
                var result2 = sut.test("AnotherTestName", function() {});
                then(function() { expect(result2.isComplete()).to.be.true; });
                then(function() { expect(result2.runCount()).to.equal(1); });
            });
        });

        when("running a test method with an inner test method call", function() {
            var innerResult;
            var result = sut.test("Outer Test", function() {
                innerResult = sut.test("Inner Test", function() {});
            });

            then(function() { expect(result.isComplete()).to.be.true; });
            then(function() { expect(result.runCount()).to.equal(1); });
            then(function() { expect(result.children()).to.deep.equal([innerResult]); });
        });

        when("running a test method with 2 inner test method calls", function() {
            var innerResult, innerResult2;
            var result = sut.test("Outer Test", function() {
                innerResult = sut.test("Inner Test", function() {});
                innerResult2 = sut.test("Inner Test 2", function() {});
            });

            then(function() { expect(result.isComplete()).to.be.true; });
            then(function() { expect(result.runCount()).to.equal(2); });
            then(function() { expect(result.children()).to.deep.equal([innerResult, innerResult2]); });
        });

        when("running a test method with 3 inner test method calls", function() {
            var innerResult, innerResult2, innerResult3;
            var result = sut.test("Outer Test", function() {
                innerResult = sut.test("Inner Test", function() {});
                innerResult2 = sut.test("Inner Test 2", function() {});
                innerResult3 = sut.test("Inner Test 3", function() {});
            });

            then(function() { expect(result.isComplete()).to.be.true; });
            then(function() { expect(result.runCount()).to.equal(3); });
            then(function() { expect(result.children()).to.deep.equal([innerResult, innerResult2, innerResult3]); });
        });

        when("running a test method with a double nested test method call", function() {
            var innerResult, innerInnerResult, innerInnerResult2;
            var result = sut.test("Outer Test", function() {
                innerResult = sut.test("Inner Test", function() {
                    innerInnerResult = sut.test("Inner Inner Test", function() {});
                    innerInnerResult2 = sut.test("Inner Inner Test 2", function() {});
                });
            });

            then(function() { expect(result.isComplete()).to.be.true; });
            then(function() { expect(result.runCount()).to.equal(2); });
            then(function() { expect(result.children()).to.deep.equal([innerResult]); });
            then(function() { expect(innerResult.children()).to.deep.equal([innerInnerResult, innerInnerResult2]); });
        });
    });

    describe("TestExecutionStatus", function() {
        var sut = new Basil.TestExecutionStatus("status name");

        then(function() {expect(sut.name()).to.equal("status name");});
        then(function() {expect(sut.isComplete()).to.be.false;});
        then(function() {expect(sut.runCount()).to.equal(0);});

        when("it finishes running", function() {
            var functionToRun = sinon.stub();
            sut.run(functionToRun);

            then(function() {expect(sut.runCount()).to.equal(1);});
            then(function() { expect(functionToRun).to.have.been.calledOnce;});

            when("no children", function() {
                then(function() {expect(sut.isComplete()).to.be.true;});
            });

            when("single child", function() {
                var child = sut.child("1st Child");

                when("child is not complete", function() {
                    child.isComplete = function() { return false; };
                    then(function() {expect(sut.isComplete()).to.be.false;});
                });

                when("child is complete", function() {
                    child.isComplete = function() { return true; };
                    then(function() {expect(sut.isComplete()).to.be.true;});
                });
            });

            when("multiple children", function() {
                var child1 = sut.child("1st Child");
                var child2 = sut.child("2nd Child");

                when("no children are complete", function() {
                    child1.isComplete = child2.isComplete = function() { return false; };
                    then(function() {expect(sut.isComplete()).to.be.false;});
                });

                when("only 1st child is complete", function() {
                    child1.isComplete = function() { return true; };
                    child2.isComplete = function() { return false; };
                    then(function() {expect(sut.isComplete()).to.be.false;});
                });

                when("only both children are complete", function() {
                    child1.isComplete = function() { return true; };
                    child2.isComplete = function() { return true; };
                    then(function() {expect(sut.isComplete()).to.be.true;});
                });
            });
        });

        when("it is running", function() {
            var runCountValueDuringFunction;
            var functionToRun = function() { runCountValueDuringFunction = sut.runCount(); };

            sut.run(functionToRun);

            then(function() { expect(runCountValueDuringFunction).to.equal(0); });
        });

        when("adding a child", function() {
            var child = sut.child("1st Child");

            then(function() {expect(child.name()).to.equal("1st Child");});
            then(function() {expect(sut.children()).to.deep.equal([child]);});

            when("retrieving a child with the same name", function() {
                var retrievedChild = sut.child("1st Child");

                then(function() { expect(retrievedChild).to.equal(child);});
            });

            when("adding another child", function() {
                var child2 = sut.child("2nd Child");

                then(function() { expect(child2.name()).to.equal("2nd Child");});
                then(function() {expect(sut.children()).to.deep.equal([child, child2]);});

                when("getting child 1", function() {
                    var retrieved = sut.child("1st Child");
                    then(function() { expect(retrieved).to.equal(child);});
                });

                when("getting child 2", function() {
                    var retrieved = sut.child("2nd Child");
                    then(function() { expect(retrieved).to.equal(child2);});
                });
            });
        });
    });

    var firstDescribeThis;
    describe("running tests", function() {
        var thisForCurrentDescribe = this;
        firstDescribeThis = firstDescribeThis || thisForCurrentDescribe;

        expect(thisForCurrentDescribe).to.not.be.null;

        then(function() { expect(this).to.equal(thisForCurrentDescribe); });
        then(function() { expect(this).to.not.equal(firstDescribeThis); });
    });
})();
