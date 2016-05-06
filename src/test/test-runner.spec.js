"use strict";
/// <reference path="../../typings/main.d.ts" />
var spec_1 = require("../spec");
var runner_1 = require("../runner");
var sinon = require("sinon");
var chai_1 = require("chai");
spec_1.describe("TestRunner", function () {
    var testEvents = new runner_1.TestEvents();
    var sut = new runner_1.TestRunner(testEvents);
    spec_1.when("running a test", function () {
        var testFn = sinon.spy();
        sut.runTest("test name", testFn);
        spec_1.it("calls the test function", function () { chai_1.expect(testFn).to.have.been.called; });
    });
    spec_1.when("runner has been aborted", function () {
        sut.abort();
        spec_1.when("running a test", function () {
            var testFn = sinon.spy();
            sut.runTest("test name", testFn);
            spec_1.it("does not call the test function", function () { chai_1.expect(testFn).to.not.have.been.called; });
        });
    });
    spec_1.describe("test methods", function () {
        spec_1.when("running empty test method", function () {
            var testFunction = sinon.stub();
            var result = sut.runTest("TestName", testFunction);
            spec_1.it("is complete", function () { return chai_1.expect(result.isComplete).to.be.true; });
            spec_1.it("has been run once", function () { return chai_1.expect(result.runCount).to.equal(1); });
            spec_1.when("running another empty test method", function () {
                var testFunction2 = sinon.stub();
                var result2 = sut.runTest("AnotherTestName", function () { });
                spec_1.it("is complete", function () { chai_1.expect(result2.isComplete).to.be.true; });
                spec_1.it("has been run", function () { chai_1.expect(result2.runCount).to.equal(1); });
                spec_1.it("adds second test to getter", function () {
                    chai_1.expect(sut.tests).to.have.members([result, result2]);
                });
            });
        });
        spec_1.when("running a test method with an inner test method call", function () {
            var innerResult;
            var innerTestFunction = sinon.stub();
            var testFunction = sinon.spy(function () {
                innerResult = sut.runTest("Inner Test", innerTestFunction);
            });
            var result = sut.runTest("Outer Test", testFunction);
            spec_1.it("completes", function () { chai_1.expect(result.isComplete).to.be.true; });
            spec_1.it("runs once", function () { chai_1.expect(result.runCount).to.equal(1); });
            spec_1.it("has children", function () { chai_1.expect(result.children).to.deep.equal([innerResult]); });
            spec_1.it("has root test", function () {
                chai_1.expect(sut.tests).to.have.members([result]);
            });
        });
        spec_1.when("running a test method with 2 inner test method calls", function () {
            var innerResult, innerResult2;
            var innerFunction1 = sinon.stub();
            var innerFunction2 = sinon.stub();
            var testFunction = sinon.spy(function () {
                innerResult = sut.runTest("Inner Test", innerFunction1);
                innerResult2 = sut.runTest("Inner Test 2", innerFunction2);
            });
            var result = sut.runTest("Outer Test", testFunction);
            spec_1.it("completes", function () { chai_1.expect(result.isComplete).to.be.true; });
            spec_1.it("runs twice", function () { chai_1.expect(result.runCount).to.equal(2); });
            spec_1.it("has both tests as children", function () { chai_1.expect(result.children).to.deep.equal([innerResult, innerResult2]); });
        });
        spec_1.when("running a test method with 3 inner test method calls", function () {
            var innerResult, innerResult2, innerResult3;
            var result = sut.runTest("Outer Test", function () {
                innerResult = sut.runTest("Inner Test", function () { });
                innerResult2 = sut.runTest("Inner Test 2", function () { });
                innerResult3 = sut.runTest("Inner Test 3", function () { });
            });
            spec_1.it("completes", function () { chai_1.expect(result.isComplete).to.be.true; });
            spec_1.it("runs thrice", function () { chai_1.expect(result.runCount).to.equal(3); });
            spec_1.it("has all tests as children", function () { chai_1.expect(result.children).to.deep.equal([innerResult, innerResult2, innerResult3]); });
        });
        spec_1.when("running a test method with a double nested test method call", function () {
            var innerResult, innerInnerResult, innerInnerResult2;
            var result = sut.runTest("Outer Test", function () {
                innerResult = sut.runTest("Inner Test", function () {
                    innerInnerResult = sut.runTest("Inner Inner Test", function () { });
                    innerInnerResult2 = sut.runTest("Inner Inner Test 2", function () { });
                });
            });
            spec_1.it("completes", function () { chai_1.expect(result.isComplete).to.be.true; });
            spec_1.it("runs twice", function () { chai_1.expect(result.runCount).to.equal(2); });
            spec_1.it("has correct children", function () { chai_1.expect(result.children).to.deep.equal([innerResult]); });
            spec_1.it("has correct grandchildren", function () { chai_1.expect(innerResult.children).to.deep.equal([innerInnerResult, innerInnerResult2]); });
        });
    });
    spec_1.describe("event raising", function () {
        var allCalls = [];
        testEvents.rootStarted.subscribe(function (t) { return allCalls.push({ functionName: "rootStarted", test: t }); });
        testEvents.rootComplete.subscribe(function (t) { return allCalls.push({ functionName: "rootComplete", test: t }); });
        testEvents.nodeFound.subscribe(function (t) { return allCalls.push({ functionName: "nodeFound", test: t }); });
        testEvents.nodeEntered.subscribe(function (t) { return allCalls.push({ functionName: "nodeEntered", test: t }); });
        testEvents.nodeExited.subscribe(function (t) { return allCalls.push({ functionName: "nodeExited", test: t }); });
        testEvents.leafComplete.subscribe(function (t) { return allCalls.push({ functionName: "leafComplete", test: t }); });
        spec_1.when("running 2 nested tests", function () {
            var innerTest1 = sinon.spy(function () { return allCalls.push({ functionName: "InnerTest1" }); });
            var innerTest2 = sinon.spy(function () { return allCalls.push({ functionName: "InnerTest2" }); });
            sut.runTest("OuterTest", function () {
                allCalls.push({ functionName: "OuterSetup" });
                sut.runTest("InnerTest1", innerTest1);
                allCalls.push({ functionName: "OuterExtra" });
                sut.runTest("InnerTest2", innerTest2);
                allCalls.push({ functionName: "OuterTearDown" });
            });
            spec_1.it("raises events in correct order", function () {
                // Like my forced indenting? :D
                var expectedCalls = [
                    { functionName: "nodeFound", name: "OuterTest" },
                    { functionName: "rootStarted", name: "OuterTest" },
                    { functionName: "nodeEntered", name: "OuterTest" },
                    /**/ { functionName: "OuterSetup", name: null },
                    /**/ { functionName: "nodeFound", name: "InnerTest1" },
                    /**/ { functionName: "nodeEntered", name: "InnerTest1" },
                    /**/ /**/ { functionName: "InnerTest1", name: null },
                    /**/ { functionName: "nodeExited", name: "InnerTest1" },
                    /**/ { functionName: "OuterExtra", name: null },
                    /**/ { functionName: "nodeFound", name: "InnerTest2" },
                    // skipped?
                    /**/ { functionName: "OuterTearDown", name: null },
                    { functionName: "nodeExited", name: "OuterTest" },
                    { functionName: "leafComplete", name: "InnerTest1" },
                    { functionName: "nodeEntered", name: "OuterTest" },
                    /**/ { functionName: "OuterSetup", name: null },
                    // skipped?
                    /**/ { functionName: "OuterExtra", name: null },
                    /**/ { functionName: "nodeEntered", name: "InnerTest2" },
                    /**/ /**/ { functionName: "InnerTest2", name: null },
                    /**/ { functionName: "nodeExited", name: "InnerTest2" },
                    /**/ { functionName: "OuterTearDown", name: null },
                    { functionName: "nodeExited", name: "OuterTest" },
                    { functionName: "leafComplete", name: "InnerTest2" },
                    { functionName: "rootComplete", name: "OuterTest" }
                ];
                var namedCalls = allCalls.map(function (c) { return { functionName: c.functionName, name: c.test ? c.test.name : null }; });
                chai_1.expect(namedCalls).to.deep.equal(expectedCalls);
            });
        });
    });
});
spec_1.describe("Test", function () {
    var sut = new runner_1.Test("Test Name", null);
    spec_1.it("has correct name", function () { chai_1.expect(sut.name).to.equal("Test Name"); });
    spec_1.it("is not complete", function () { chai_1.expect(sut.isComplete).to.be.false; });
    spec_1.it("has runcount of 0", function () { chai_1.expect(sut.runCount).to.equal(0); });
    spec_1.it("has not passed", function () { chai_1.expect(sut.hasPassed).to.be.false; });
    spec_1.it("has not been skipped", function () { chai_1.expect(sut.wasSkipped).to.be.false; });
    spec_1.it("has no error", function () { chai_1.expect(sut.error).to.be.null; });
    spec_1.it("has key equal to lcase name", function () { chai_1.expect(sut.key).to.equal('test name'); });
    spec_1.it("has full key equal to lcase name", function () { chai_1.expect(sut.fullKey).to.equal('test name'); });
    spec_1.when("it finishes running", function () {
        var functionToRun = sinon.stub();
        sut.run(functionToRun);
        spec_1.it("runcount is incremented", function () { chai_1.expect(sut.runCount).to.equal(1); });
        spec_1.it("test funciton is called", function () { chai_1.expect(functionToRun).to.have.been.calledOnce; });
        spec_1.it("test has passed", function () { chai_1.expect(sut.hasPassed).to.be.true; });
        spec_1.when("no children", function () {
            spec_1.it("is complete", function () { chai_1.expect(sut.isComplete).to.be.true; });
        });
        spec_1.when("single child", function () {
            var child = sut.child("1st Child");
            spec_1.when("child is not complete", function () {
                spec_1.it("is not complete", function () { chai_1.expect(sut.isComplete).to.be.false; });
            });
            spec_1.when("child runs successfully", function () {
                child.run(function () { });
                spec_1.it("is complete", function () { chai_1.expect(sut.isComplete).to.be.true; });
                spec_1.it("has passed", function () { chai_1.expect(sut.hasPassed).to.be.true; });
            });
            spec_1.when("child runs with failure", function () {
                child.run(function () { throw "Error"; });
                spec_1.it("is complete", function () { chai_1.expect(sut.isComplete).to.be.true; });
                spec_1.it("has failed", function () { chai_1.expect(sut.hasPassed).to.be.false; });
            });
        });
        spec_1.when("multiple children", function () {
            var child1 = sut.child("1st Child");
            var child2 = sut.child("2nd Child");
            spec_1.when("no children are complete", function () {
                spec_1.it("is not complete", function () { chai_1.expect(sut.isComplete).to.be.false; });
            });
            spec_1.when("1st child runs successfully", function () {
                child1.run(function () { });
                spec_1.it("is not complete", function () { chai_1.expect(sut.isComplete).to.be.false; });
                spec_1.it("has not passed", function () { chai_1.expect(sut.hasPassed).to.be.false; });
                spec_1.when("2nd child runs successfully", function () {
                    child2.run(function () { });
                    spec_1.it("is complete", function () { chai_1.expect(sut.isComplete).to.be.true; });
                    spec_1.it("has passed", function () { chai_1.expect(sut.hasPassed).to.be.true; });
                });
                spec_1.when("2nd child runs but fails", function () {
                    child2.run(function () { throw "Error"; });
                    spec_1.it("is complete", function () { chai_1.expect(sut.isComplete).to.be.true; });
                    spec_1.it("has failed", function () { chai_1.expect(sut.hasPassed).to.be.false; });
                });
            });
        });
    });
    spec_1.when("it is running", function () {
        var runCountValueDuringFunction;
        var passedInContext = {};
        var functionToRun = function () {
            runCountValueDuringFunction = sut.runCount;
        };
        sut.run(functionToRun);
        spec_1.it("doesn't update runcount until function completes", function () { chai_1.expect(runCountValueDuringFunction).to.equal(0); });
    });
    spec_1.when("it is skipped", function () {
        sut.skip();
        spec_1.it("is complete", function () { chai_1.expect(sut.isComplete).to.be.true; });
        spec_1.it("was skipped", function () { chai_1.expect(sut.wasSkipped).to.be.true; });
    });
    spec_1.when("adding a child", function () {
        var child = sut.child("1st Child");
        spec_1.it("creates child with correct name", function () { chai_1.expect(child.name).to.equal("1st Child"); });
        spec_1.it("adds child", function () { chai_1.expect(sut.children).to.deep.equal([child]); });
        spec_1.it("gives child correct key", function () { chai_1.expect(child.key).to.equal('1st child'); });
        spec_1.it("gives child correct full key", function () { chai_1.expect(child.fullKey).to.equal('test name>1st child'); });
        spec_1.when("retrieving a child with the same name", function () {
            var retrievedChild = sut.child("1st Child");
            spec_1.it("returns correct child", function () { chai_1.expect(retrievedChild).to.equal(child); });
        });
        spec_1.when("adding another child", function () {
            var child2 = sut.child("2nd Child");
            spec_1.it("creates another child", function () { chai_1.expect(child2.name).to.equal("2nd Child"); });
            spec_1.it("adds child", function () { chai_1.expect(sut.children).to.deep.equal([child, child2]); });
            spec_1.when("getting child 1", function () {
                var retrieved = sut.child("1st Child");
                spec_1.it("gets correct child", function () { chai_1.expect(retrieved).to.equal(child); });
            });
            spec_1.when("getting child 2", function () {
                var retrieved = sut.child("2nd Child");
                spec_1.it("gets correct child", function () { chai_1.expect(retrieved).to.equal(child2); });
            });
        });
    });
    spec_1.when("run method throws an Error", function () {
        var expectedError = new Error("ErrorText");
        var failingFunction = sinon.spy(function () { throw expectedError; });
        var thisValue = {};
        sut.run(failingFunction);
        spec_1.it("has not passed", function () { chai_1.expect(sut.hasPassed).to.be.false; });
        spec_1.it("has an error with message from exception", function () { chai_1.expect(sut.error).to.equal(expectedError); });
        spec_1.when("calling the inspection function", function () {
            failingFunction.reset();
            try {
                sut.inspect();
            }
            catch (e) { }
            spec_1.it("calls the test function", function () {
                chai_1.expect(failingFunction.callCount).to.equal(1);
            });
        });
    });
    spec_1.when("run method throws a non-error", function () {
        var expectedError = "ErrorText";
        var failingFunction = function () { throw expectedError; };
        sut.run(failingFunction);
        spec_1.it("fails", function () { chai_1.expect(sut.hasPassed).to.be.false; });
        spec_1.it("has the error", function () { chai_1.expect(sut.error.message).to.equal("ErrorText"); });
    });
});
