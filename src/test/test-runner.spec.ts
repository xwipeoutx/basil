/// <reference path="../../typings/main.d.ts" />
import { describe, when, then, it } from "../spec";
import { TestEvents, TestRunner, Test }  from "../runner"
import * as sinon from "sinon";
import { expect } from "chai";

describe("TestRunner", () => {
    var testEvents = new TestEvents();
    var sut = new TestRunner(testEvents);

    when("running a test", () => {
        var testFn = sinon.spy();
        sut.runTest("test name", testFn);

        it("calls the test function", () => { expect(testFn).to.have.been.called; });
    });

    when("runner has been aborted", () => {
        sut.abort();

        when("running a test", () => {
            var testFn = sinon.spy();
            sut.runTest("test name", testFn);

            it("does not call the test function", () => { expect(testFn).to.not.have.been.called; });
        });
    });

    describe("test methods", () => {
        when("running empty test method", () => {
            var testFunction = sinon.stub();
            var result = sut.runTest("TestName", testFunction);

            it("is complete", () => expect(result.isComplete).to.be.true);
            it("has been run once", () => expect(result.runCount).to.equal(1));

            when("running another empty test method", () => {
                var testFunction2 = sinon.stub();
                var result2 = sut.runTest("AnotherTestName", () => { });
                it("is complete", () => { expect(result2.isComplete).to.be.true; });
                it("has been run", () => { expect(result2.runCount).to.equal(1); });

                it("adds second test to getter", () => {
                    expect(sut.tests).to.have.members([result, result2]);
                });
            });
        });

        when("running a test method with an inner test method call", () => {
            var innerResult: Test;
            var innerTestFunction = sinon.stub();
            var testFunction = sinon.spy(() => {
                innerResult = sut.runTest("Inner Test", innerTestFunction);
            });

            var result = sut.runTest("Outer Test", testFunction);

            it("completes", () => { expect(result.isComplete).to.be.true; });
            it("runs once", () => { expect(result.runCount).to.equal(1); });
            it("has children", () => { expect(result.children).to.deep.equal([innerResult]); });

            it("has root test", () => {
                expect(sut.tests).to.have.members([result]);
            });
        });

        when("running a test method with 2 inner test method calls", () => {
            var innerResult: Test, innerResult2: Test;
            var innerFunction1 = sinon.stub();
            var innerFunction2 = sinon.stub();
            var testFunction = sinon.spy(() => {
                innerResult = sut.runTest("Inner Test", innerFunction1);
                innerResult2 = sut.runTest("Inner Test 2", innerFunction2);
            });
            var result = sut.runTest("Outer Test", testFunction);

            it("completes", () => { expect(result.isComplete).to.be.true; });
            it("runs twice", () => { expect(result.runCount).to.equal(2); });
            it("has both tests as children", () => { expect(result.children).to.deep.equal([innerResult, innerResult2]); });
        });

        when("running a test method with 3 inner test method calls", () => {
            var innerResult: Test, innerResult2: Test, innerResult3: Test;
            var result = sut.runTest("Outer Test", () => {
                innerResult = sut.runTest("Inner Test", () => { });
                innerResult2 = sut.runTest("Inner Test 2", () => { });
                innerResult3 = sut.runTest("Inner Test 3", () => { });
            });

            it("completes", () => { expect(result.isComplete).to.be.true; });
            it("runs thrice", () => { expect(result.runCount).to.equal(3); });
            it("has all tests as children", () => { expect(result.children).to.deep.equal([innerResult, innerResult2, innerResult3]); });
        });

        when("running a test method with a double nested test method call", () => {
            var innerResult: Test, innerInnerResult: Test, innerInnerResult2: Test;
            var result = sut.runTest("Outer Test", () => {
                innerResult = sut.runTest("Inner Test", () => {
                    innerInnerResult = sut.runTest("Inner Inner Test", () => { });
                    innerInnerResult2 = sut.runTest("Inner Inner Test 2", () => { });
                });
            });

            it("completes", () => { expect(result.isComplete).to.be.true; });
            it("runs twice", () => { expect(result.runCount).to.equal(2); });
            it("has correct children", () => { expect(result.children).to.deep.equal([innerResult]); });
            it("has correct grandchildren", () => { expect(innerResult.children).to.deep.equal([innerInnerResult, innerInnerResult2]); });
        });
    });

    describe("event raising", () => {
        var allCalls: { functionName: string, test?: Test }[] = [];

        testEvents.rootStarted.subscribe(t => allCalls.push({ functionName: "rootStarted", test: t }));
        testEvents.rootComplete.subscribe(t => allCalls.push({ functionName: "rootComplete", test: t }));
        testEvents.nodeFound.subscribe(t => allCalls.push({ functionName: "nodeFound", test: t }));
        testEvents.nodeEntered.subscribe(t => allCalls.push({ functionName: "nodeEntered", test: t }));
        testEvents.nodeExited.subscribe(t => allCalls.push({ functionName: "nodeExited", test: t }));
        testEvents.leafComplete.subscribe(t => allCalls.push({ functionName: "leafComplete", test: t }));

        when("running 2 nested tests", () => {
            var innerTest1 = sinon.spy(() => allCalls.push({ functionName: "InnerTest1" }));
            var innerTest2 = sinon.spy(() => allCalls.push({ functionName: "InnerTest2" }));

            sut.runTest("OuterTest", () => {
                allCalls.push({ functionName: "OuterSetup" })
                sut.runTest("InnerTest1", innerTest1);
                allCalls.push({ functionName: "OuterExtra" })
                sut.runTest("InnerTest2", innerTest2);
                allCalls.push({ functionName: "OuterTearDown" })
            });

            it("raises events in correct order", () => {
                // Like my forced indenting? :D
                var expectedCalls: { functionName: string, name?: string }[] = [
                    { functionName: "nodeFound", name: "OuterTest" },
                    { functionName: "rootStarted", name: "OuterTest" },

                    { functionName: "nodeEntered", name: "OuterTest" },
                    /**/{ functionName: "OuterSetup", name: null },
                    /**/{ functionName: "nodeFound", name: "InnerTest1" },
                    /**/{ functionName: "nodeEntered", name: "InnerTest1" },
                    /**//**/{ functionName: "InnerTest1", name: null },
                    /**/{ functionName: "nodeExited", name: "InnerTest1" },
                    /**/{ functionName: "OuterExtra", name: null },
                    /**/{ functionName: "nodeFound", name: "InnerTest2" },
                    // skipped?
                    /**/{ functionName: "OuterTearDown", name: null },
                    { functionName: "nodeExited", name: "OuterTest" },
                    { functionName: "leafComplete", name: "InnerTest1" },

                    { functionName: "nodeEntered", name: "OuterTest" },
                    /**/{ functionName: "OuterSetup", name: null },
                    // skipped?
                    /**/{ functionName: "OuterExtra", name: null },
                    /**/{ functionName: "nodeEntered", name: "InnerTest2" },
                    /**//**/{ functionName: "InnerTest2", name: null },
                    /**/{ functionName: "nodeExited", name: "InnerTest2" },
                    /**/{ functionName: "OuterTearDown", name: null },
                    { functionName: "nodeExited", name: "OuterTest" },
                    { functionName: "leafComplete", name: "InnerTest2" },

                    { functionName: "rootComplete", name: "OuterTest" }
                ]

                var namedCalls = allCalls.map(c => { return { functionName: c.functionName, name: c.test ? c.test.name : null } });

                expect(namedCalls).to.deep.equal(expectedCalls);
            });
        });
    });
});

describe("Test", () => {
    var sut = new Test("Test Name", null);

    it("has correct name", () => { expect(sut.name).to.equal("Test Name"); });
    it("is not complete", () => { expect(sut.isComplete).to.be.false; });
    it("has runcount of 0", () => { expect(sut.runCount).to.equal(0); });
    it("has not passed", () => { expect(sut.hasPassed).to.be.false; });
    it("has not been skipped", () => { expect(sut.wasSkipped).to.be.false; });
    it("has no error", () => { expect(sut.error).to.be.null; });
    it("has key equal to lcase name", () => { expect(sut.key).to.equal('test name'); });
    it("has full key equal to lcase name", () => { expect(sut.fullKey).to.equal('test name'); });

    when("it finishes running", () => {
        var functionToRun = sinon.stub();
        sut.run(functionToRun);

        it("runcount is incremented", () => { expect(sut.runCount).to.equal(1); });
        it("test funciton is called", () => { expect(functionToRun).to.have.been.calledOnce; });
        it("test has passed", () => { expect(sut.hasPassed).to.be.true; });

        when("no children", () => {
            it("is complete", () => { expect(sut.isComplete).to.be.true; });
        });

        when("single child", () => {
            var child = sut.child("1st Child");

            when("child is not complete", () => {
                it("is not complete", () => { expect(sut.isComplete).to.be.false; });
            });

            when("child runs successfully", () => {
                child.run(() => { });

                it("is complete", () => { expect(sut.isComplete).to.be.true; });
                it("has passed", () => { expect(sut.hasPassed).to.be.true; });
            });

            when("child runs with failure", () => {
                child.run(() => { throw "Error" });

                it("is complete", () => { expect(sut.isComplete).to.be.true; });
                it("has failed", () => { expect(sut.hasPassed).to.be.false; });
            });
        });

        when("multiple children", () => {
            var child1 = sut.child("1st Child");
            var child2 = sut.child("2nd Child");

            when("no children are complete", () => {
                it("is not complete", () => { expect(sut.isComplete).to.be.false; });
            });

            when("1st child runs successfully", () => {
                child1.run(() => { });

                it("is not complete", () => { expect(sut.isComplete).to.be.false; });
                it("has not passed", () => { expect(sut.hasPassed).to.be.false; });

                when("2nd child runs successfully", () => {
                    child2.run(() => { });

                    it("is complete", () => { expect(sut.isComplete).to.be.true; });
                    it("has passed", () => { expect(sut.hasPassed).to.be.true; });
                });

                when("2nd child runs but fails", () => {
                    child2.run(() => { throw "Error"; });

                    it("is complete", () => { expect(sut.isComplete).to.be.true; });
                    it("has failed", () => { expect(sut.hasPassed).to.be.false; });
                });
            });
        });
    });

    when("it is running", () => {
        var runCountValueDuringFunction: number;
        var passedInContext = {};
        var functionToRun = () => {
            runCountValueDuringFunction = sut.runCount;
        };

        sut.run(functionToRun);

        it("doesn't update runcount until function completes", () => { expect(runCountValueDuringFunction).to.equal(0); });
    });

    when("it is skipped", () => {
        sut.skip();

        it("is complete", () => { expect(sut.isComplete).to.be.true; });
        it("was skipped", () => { expect(sut.wasSkipped).to.be.true; });
    });

    when("adding a child", () => {
        var child = sut.child("1st Child");

        it("creates child with correct name", () => { expect(child.name).to.equal("1st Child"); });
        it("adds child", () => { expect(sut.children).to.deep.equal([child]); });
        it("gives child correct key", () => { expect(child.key).to.equal('1st child'); });
        it("gives child correct full key", () => { expect(child.fullKey).to.equal('test name>1st child'); });

        when("retrieving a child with the same name", () => {
            var retrievedChild = sut.child("1st Child");

            it("returns correct child", () => { expect(retrievedChild).to.equal(child); });
        });

        when("adding another child", () => {
            var child2 = sut.child("2nd Child");

            it("creates another child", () => { expect(child2.name).to.equal("2nd Child"); });
            it("adds child", () => { expect(sut.children).to.deep.equal([child, child2]); });

            when("getting child 1", () => {
                var retrieved = sut.child("1st Child");
                it("gets correct child", () => { expect(retrieved).to.equal(child); });
            });

            when("getting child 2", () => {
                var retrieved = sut.child("2nd Child");
                it("gets correct child", () => { expect(retrieved).to.equal(child2); });
            });
        });
    });

    when("run method throws an Error", () => {
        var expectedError = new Error("ErrorText");
        var failingFunction = sinon.spy(() => { throw expectedError; });
        var thisValue = {};
        sut.run(failingFunction);

        it("has not passed", () => { expect(sut.hasPassed).to.be.false; });
        it("has an error with message from exception", () => { expect(sut.error).to.equal(expectedError); });

        when("calling the inspection function", () => {
            failingFunction.reset();
            try { sut.inspect(); } catch (e) { }

            it("calls the test function", () => {
                expect(failingFunction.callCount).to.equal(1);
            });
        })
    });

    when("run method throws a non-error", () => {
        var expectedError = "ErrorText";
        var failingFunction = () => { throw expectedError; }
        sut.run(failingFunction);

        it("fails", () => { expect(sut.hasPassed).to.be.false; });
        it("has the error", () => { expect(sut.error.message).to.equal("ErrorText"); });
    });
});