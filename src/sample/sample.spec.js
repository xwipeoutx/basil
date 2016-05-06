"use strict";
var spec_1 = require("../spec");
//import { describe, when, then, it } from "grebe/spec"; // Use this instead when not bootstrapping
var chai_1 = require("chai");
var sinon = require("sinon");
chai_1.should();
spec_1.describe("Assertions", function () {
    spec_1.it("Works with chai", function () {
        "runsOnChai".should.not.be.false;
    });
});
spec_1.describe("Mocking", function () {
    var sampleFunc = sinon.stub();
    sampleFunc();
    spec_1.it("Works with sinon", function () {
        sampleFunc.should.have.been.called;
    });
});
spec_1.describe("Nested test setup", function () {
    spec_1.when("a variable is declared", function () {
        var variable = "initially declared value";
        spec_1.then("it can be asserted on in a test", function () {
            variable.should.equal("initially declared value");
        });
        spec_1.when("the variable is changed", function () {
            variable = "changed value";
            spec_1.then("the new value can be asserted on", function () {
                variable.should.equal("changed value");
            });
        });
        spec_1.it("has not run previous test setups", function () {
            variable.should.equal("initially declared value");
        });
        variable = null;
        spec_1.it("runs additional code", function () {
            chai_1.expect(variable).to.be.null;
        });
        spec_1.when("there", function () {
            var codeReadability = "no ";
            spec_1.when("is", function () {
                codeReadability += "nonsense ";
                spec_1.when("a lot of", function () {
                    codeReadability += "and ";
                    spec_1.when("nested", function () {
                        codeReadability += "easily ";
                        spec_1.when("setup", function () {
                            codeReadability += "read.";
                            spec_1.then("assert", function () {
                                codeReadability.should.equal("no nonsense and easily read.");
                            });
                        });
                    });
                });
            });
        });
    });
});
spec_1.describe("Sample Failure", function () {
    spec_1.when("a test fails", function () {
        spec_1.it("can be viewed", function () {
            throw new Error("Error message");
        });
    });
    spec_1.when("in a later test", function () {
        spec_1.it("hasn't been affected by an earlier failure", function () {
            true.should.be.true;
        });
    });
});
spec_1.describe("Test name", function () {
    spec_1.it("comes from first argument", function () {
        true.should.be.true;
    });
});
