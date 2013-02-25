(function() {
    describe("Intercepter", function() {
        var global = {};
        var destination = sinon.stub();
        var sut = new Basil.Interceptor(global, destination);

        when("intercepting calls", function() {
            sut.intercept('someMethod');

            then(function() { expect(global.someMethod).to.be.a('function');})

            when("restoring method", function() {
                sut.restore();

                then(function() { expect(global.someMethod).to.be.undefined; });
            });

            when("calling intercepted method", function() {
                when("with no arguments", function() {
                    global.someMethod();
                    then(function() { expect(destination).to.be.have.been.called;});
                });

                when("with arguments", function() {
                    global.someMethod('foo', 'bar');
                    then(function() { expect(destination).to.have.been.calledWith('foo', 'bar');});
                });
            });

            when("being told to pause", function() {
                sut.pause();

                when("calling intercepted method", function() {
                    global.someMethod('arg for first call');

                    then(function() { expect(destination).to.not.have.been.called; });

                    when("resuming", function() {
                        sut.resume();
                        then(function() { expect(destination).to.have.been.calledWith('arg for first call'); });
                    });

                    when("calling intercepted method again", function() {
                        global.someMethod('arg for second call');
                        then(function() { expect(destination).to.not.have.been.called; });

                        when("resuming", function() {
                            sut.resume();

                            then(function() { expect(destination).to.have.been.calledTwice; });
                            then(function() { expect(destination).to.have.been.calledWith('arg for first call'); });
                            then(function() { expect(destination).to.have.been.calledWith('arg for second call'); });
                        });
                    });
                });
            });
        });

        when("intercepting calls to an existing method", function() {
            global.existingMethod = function() {};

            it('throws an error', function() {
                expect(function() {
                    sut.intercept('existingMethod');
                }).to.throw(Basil.CannotInterceptExistingMethodError);
            });
        });

    });

    describe("TestRunner", function() {
        var sut = new Basil.TestRunner();

        describe("test methods", function() {
            when("running empty test method", function() {
                var testFunction = sinon.stub();
                var result = sut.test("TestName", testFunction);

                then(function() { expect(result.isComplete()).to.be.true; });
                then(function() { expect(result.runCount()).to.equal(1); });
                then(function() { expect(testFunction).to.not.have.been.calledOn(undefined); });

                when("running another empty test method", function() {
                    var testFunction2 = sinon.stub();
                    var result2 = sut.test("AnotherTestName", function() {});
                    then(function() { expect(result2.isComplete()).to.be.true; });
                    then(function() { expect(result2.runCount()).to.equal(1); });
                    then(function() { expect(testFunction2).to.not.have.been.calledOn(testFunction.firstCall.thisValue); });
                });
            });

            when("running a test method with an inner test method call", function() {
                var innerResult;
                var innerTestFunction = sinon.stub();
                var testFunction = function() {
                    innerResult = sut.test("Inner Test", innerTestFunction);
                };
                testFunction = this.spy(testFunction);
                var result = sut.test("Outer Test", testFunction);

                then(function() { expect(result.isComplete()).to.be.true; });
                then(function() { expect(result.runCount()).to.equal(1); });
                then(function() { expect(result.children()).to.deep.equal([innerResult]); });

                then("inner function uses same 'this' value as outer", function() {
                    expect(innerTestFunction).to.have.been.calledOn(testFunction.firstCall.thisValue);
                });
            });

            when("running a test method with 2 inner test method calls", function() {
                var innerResult, innerResult2;
                var innerFunction1 = sinon.stub();
                var innerFunction2 = sinon.stub();
                var testFunction = function() {
                    innerResult = sut.test("Inner Test", innerFunction1);
                    innerResult2 = sut.test("Inner Test 2", innerFunction2);
                };
                testFunction = this.spy(testFunction);
                var result = sut.test("Outer Test", testFunction);

                then(function() { expect(result.isComplete()).to.be.true; });
                then(function() { expect(result.runCount()).to.equal(2); });
                then(function() { expect(result.children()).to.deep.equal([innerResult, innerResult2]); });

                then("each outer call has different 'this' values", function() {
                    expect(testFunction.firstCall.thisValue).to.not.equal(testFunction.secondCall.thisValue);
                });

                then("inner function 1 uses same 'this' value as first outer call", function() {
                    expect(innerFunction1).to.have.been.calledOn(testFunction.firstCall.thisValue);
                });

                then("inner function 2 uses same 'this' value as second outer call", function() {
                    expect(innerFunction2).to.have.been.calledOn(testFunction.secondCall.thisValue);
                });
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

            when("running a named test method without specifying a name", function() {
                var result = sut.test(function NamedFunctionName () {});
                then(function() { expect(result.name()).to.equal("NamedFunctionName"); });
            });

            when("running an unnamed test method without specifying a name", function() {
                var result = sut.test(function() { expect('name').to.equal('name'); });
                then(function() { expect(result.name()).to.equal("expect name to equal name"); });
            });

            when("running a named test method without specifying a name", function() {
                var result = sut.test(function TestName () {});

                then("name extracted from test name", function() {
                    expect(result.name()).to.equal("TestName");
                });
            });
        });

        describe("plugins", function() {
            when("registering a root plugin", function() {
                var pluginFunction = sinon.stub();
                sut.registerRootPlugin(pluginFunction);

                then(function() { expect(pluginFunction).to.not.have.been.called; });

                when("plugin does not yield", function() {
                    it("throws", function() {
                        expect(function() { sut.test("TestName", function() {}); }).to.throw();
                    });
                });

                when("plugin yields", function() {
                    pluginFunction.yields();
                    var result = sut.test("TestName", function() {});

                    then(function() { expect(pluginFunction).to.have.been.called; });
                    then(function() { expect(result.isComplete()).to.be.true; });
                });

                pluginFunction.yields();

                when("registering a second root plugin", function() {
                    var pluginFunction2 = sinon.stub().yields();
                    sut.registerRootPlugin(pluginFunction2);

                    when("running test", function() {
                        sut.test("TestName", function() {});
                        then(function() {expect(pluginFunction2).to.have.been.calledBefore(pluginFunction);});
                    });
                });
            });

            when("root plugin callback returns", function() {
                var callbackReturnValue;
                var pluginFunction = function(cb) {
                    callbackReturnValue = cb();
                };
                sut.registerRootPlugin(pluginFunction);
                var result = sut.test("TestName", function() {});

                then(function() { expect(callbackReturnValue).to.equal(result); });
            });

            when("register a setup plugin", function() {
                var pluginFunction = sinon.stub();
                sut.registerSetupPlugin(pluginFunction);

                then(function() { expect(pluginFunction).to.not.have.been.called; });

                when("plugin does not yield", function() {
                    it("throws", function() {
                        expect(function() { sut.test("TestName", function() {}); }).to.throw();
                    });
                });

                when("running 2 nested tests", function() {
                    pluginFunction.yields();
                    var innerTest1 = sinon.stub();
                    var innerTest2 = sinon.stub();

                    sut.test(function OuterTest () {
                        sut.test("InnerTest1", innerTest1);
                        sut.test("InnerTest2", innerTest2);
                    });

                    then(function() { expect(pluginFunction).to.have.been.calledTwice;});
                    then(function() { expect(innerTest1).to.have.been.calledOn(pluginFunction.firstCall.thisValue);});
                    then(function() { expect(innerTest2).to.have.been.calledOn(pluginFunction.secondCall.thisValue);});
                });
            });

            when("setup plugin callback returns", function() {
                var callbackReturnValue;
                var pluginFunction = function(cb) {
                    callbackReturnValue = cb();
                };
                sut.registerSetupPlugin(pluginFunction);
                var result = sut.test("TestName", function() {});

                then(function() { expect(callbackReturnValue).to.be.null; });
            });
        });
    });

    describe("Test", function() {
        var sut = new Basil.Test("test name");

        then(function() {expect(sut.name()).to.equal("test name");});
        then(function() {expect(sut.isComplete()).to.be.false;});
        then(function() {expect(sut.runCount()).to.equal(0);});
        then(function() {expect(sut.hasPassed()).to.be.false;});
        then(function() {expect(sut.error()).to.be.null;});

        when("it finishes running", function() {
            var functionToRun = sinon.stub();
            sut.run(functionToRun);

            then(function() {expect(sut.runCount()).to.equal(1);});
            then(function() { expect(functionToRun).to.have.been.calledOnce;});
            then(function() {expect(sut.hasPassed()).to.be.true;});

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

                    when("child has passed", function() {
                        child.hasPassed = sinon.stub().returns(true);
                        then(function() {expect(sut.hasPassed()).to.be.true;});
                    });

                    when("child has failed", function() {
                        child.hasPassed = sinon.stub().returns(false);
                        then(function() {expect(sut.hasPassed()).to.be.false;});
                    });
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

                when("both children are complete", function() {
                    child1.isComplete = function() { return true; };
                    child2.isComplete = function() { return true; };
                    then(function() {expect(sut.isComplete()).to.be.true;});

                    when("only child2 has passed", function() {
                        child1.hasPassed = sinon.stub().returns(false);
                        child2.hasPassed = sinon.stub().returns(true);
                        then(function() {expect(sut.hasPassed()).to.be.false;});
                    });

                    when("only child1 has passed", function() {
                        child1.hasPassed = sinon.stub().returns(true);
                        child2.hasPassed = sinon.stub().returns(false);
                        then(function() {expect(sut.hasPassed()).to.be.false;});
                    });

                    when("both children have passed", function() {
                        child1.hasPassed = sinon.stub().returns(true);
                        child2.hasPassed = sinon.stub().returns(true);
                        then(function() {expect(sut.hasPassed()).to.be.true;});
                    });
                });
            });
        });

        when("it is running", function() {
            var runCountValueDuringFunction, contextDuringFunction;
            var passedInContext = {};
            var functionToRun = function() {
                runCountValueDuringFunction = sut.runCount();
                contextDuringFunction = this;
            };

            sut.run(functionToRun, passedInContext);

            then(function() { expect(runCountValueDuringFunction).to.equal(0); });
            then(function() { expect(contextDuringFunction).to.equal(passedInContext); });
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

        when("run method throws an Error", function() {
            var expectedError = new Error("ErrorText");
            var failingFunction = function() { throw expectedError;}
            var thisValue = {};
            sut.run(failingFunction, thisValue);

            then(function() {expect(sut.hasPassed()).to.be.false;});
            then(function() {expect(sut.error()).to.equal(expectedError);});
            then(function() {expect(sut.inspect).to.equal(failingFunction);});
            then(function() {expect(sut.inspectThisValue).to.equal(thisValue);});
        });

        when("run method throws a non-error", function() {
            var expectedError = "ErrorText";
            var failingFunction = function() { throw expectedError;}
            sut.run(failingFunction);

            then(function() {expect(sut.hasPassed()).to.be.false;});
            then(function() {expect(sut.error().message).to.equal("ErrorText");});
        });
    });
})();
