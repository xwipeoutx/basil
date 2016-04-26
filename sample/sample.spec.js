"use strict";
var basil_1 = require("../src/basil");
var chai_1 = require("chai");
var sinon = require("sinon");
chai_1.should();
basil_1.describe("Assertions", function () {
    basil_1.it("Works with chai", function () {
        "runsOnChai".should.not.be.false;
    });
});
basil_1.describe("Mocking", function () {
    var sampleFunc = sinon.stub();
    sampleFunc();
    basil_1.it("Works with sinon", function () {
        sampleFunc.should.have.been.called;
    });
});
basil_1.describe("Nested test setup", function () {
    basil_1.when("a variable is declared", function () {
        var variable = "initially declared value";
        basil_1.then("it can be asserted on in a test", function () {
            variable.should.equal("initially declared value");
        });
        basil_1.when("the variable is changed", function () {
            variable = "changed value";
            basil_1.then("the new value can be asserted on", function () {
                variable.should.equal("changed value");
            });
        });
        basil_1.it("has not run previous test setups", function () {
            variable.should.equal("initially declared value");
        });
        variable = null;
        basil_1.it("runs additional code", function () {
            chai_1.expect(variable).to.be.null;
        });
        basil_1.when("there", function () {
            var codeReadability = "no ";
            basil_1.when("is", function () {
                codeReadability += "nonsense ";
                basil_1.when("a lot of", function () {
                    codeReadability += "and ";
                    basil_1.when("nested", function () {
                        codeReadability += "easily ";
                        basil_1.when("setup", function () {
                            codeReadability += "read.";
                            basil_1.then("assert", function () {
                                codeReadability.should.equal("no nonsense and easily read.");
                            });
                        });
                    });
                });
            });
        });
    });
});
basil_1.describe("Sample Failure", function () {
    basil_1.when("a test fails", function () {
        basil_1.it("can be viewed", function () {
            throw new Error("Error message");
        });
    });
    basil_1.when("in a later test", function () {
        basil_1.it("hasn't been affected by an earlier failure", function () {
            true.should.be.true;
        });
    });
});
basil_1.describe("Test name", function () {
    basil_1.it("comes from first argument", function () {
        true.should.be.true;
    });
});
