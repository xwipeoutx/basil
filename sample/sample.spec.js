"use strict";
var grebe_1 = require("../src/grebe");
var chai_1 = require("chai");
var sinon = require("sinon");
chai_1.should();
grebe_1.describe("Assertions", function () {
    grebe_1.it("Works with chai", function () {
        "runsOnChai".should.not.be.false;
    });
});
grebe_1.describe("Mocking", function () {
    var sampleFunc = sinon.stub();
    sampleFunc();
    grebe_1.it("Works with sinon", function () {
        sampleFunc.should.have.been.called;
    });
});
grebe_1.describe("Nested test setup", function () {
    grebe_1.when("a variable is declared", function () {
        var variable = "initially declared value";
        grebe_1.then("it can be asserted on in a test", function () {
            variable.should.equal("initially declared value");
        });
        grebe_1.when("the variable is changed", function () {
            variable = "changed value";
            grebe_1.then("the new value can be asserted on", function () {
                variable.should.equal("changed value");
            });
        });
        grebe_1.it("has not run previous test setups", function () {
            variable.should.equal("initially declared value");
        });
        variable = null;
        grebe_1.it("runs additional code", function () {
            chai_1.expect(variable).to.be.null;
        });
        grebe_1.when("there", function () {
            var codeReadability = "no ";
            grebe_1.when("is", function () {
                codeReadability += "nonsense ";
                grebe_1.when("a lot of", function () {
                    codeReadability += "and ";
                    grebe_1.when("nested", function () {
                        codeReadability += "easily ";
                        grebe_1.when("setup", function () {
                            codeReadability += "read.";
                            grebe_1.then("assert", function () {
                                codeReadability.should.equal("no nonsense and easily read.");
                            });
                        });
                    });
                });
            });
        });
    });
});
grebe_1.describe("Sample Failure", function () {
    grebe_1.when("a test fails", function () {
        grebe_1.it("can be viewed", function () {
            throw new Error("Error message");
        });
    });
    grebe_1.when("in a later test", function () {
        grebe_1.it("hasn't been affected by an earlier failure", function () {
            true.should.be.true;
        });
    });
});
grebe_1.describe("Test name", function () {
    grebe_1.it("comes from first argument", function () {
        true.should.be.true;
    });
});
