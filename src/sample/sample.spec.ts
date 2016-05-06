import { describe, when, then, it } from "../spec";
//import { describe, when, then, it } from "grebe/spec"; // Use this instead when not bootstrapping
import { expect, should } from "chai";
import * as sinon from "sinon";

should();
describe("Assertions", () => {
    it("Works with chai", () => {
        "runsOnChai".should.not.be.false;
    });
});

describe("Mocking", () => {
    var sampleFunc = sinon.stub();
    sampleFunc();

    it("Works with sinon", () => {
        sampleFunc.should.have.been.called;
    });
});

describe("Nested test setup", () => {
    when("a variable is declared", () => {
        var variable = "initially declared value";

        then("it can be asserted on in a test", () => {
            variable.should.equal("initially declared value");
        });

        when("the variable is changed", () => {
            variable = "changed value";

            then("the new value can be asserted on", () => {
                variable.should.equal("changed value");
            })
        });

        it("has not run previous test setups", () => {
            variable.should.equal("initially declared value");
        });

        variable = null;

        it("runs additional code", () => {
            expect(variable).to.be.null;
        });

        when("there", () => {
            var codeReadability = "no ";

            when("is", () => {
                codeReadability += "nonsense ";

                when("a lot of", () => {
                    codeReadability += "and ";

                    when("nested", () => {
                        codeReadability += "easily "

                        when("setup", () => {
                            codeReadability += "read.";

                            then("assert", () => {
                                codeReadability.should.equal("no nonsense and easily read.");
                            })
                        });
                    });
                });
            });
        });
    });
});

describe("Sample Failure", () => {
    when("a test fails", () => {
        it("can be viewed", () => {
            throw new Error("Error message");
        });
    });

    when("in a later test", () => {
        it("hasn't been affected by an earlier failure", () => {
            true.should.be.true;
        });
    });
});

describe("Test name", () => {
    it("comes from first argument", () => {
        true.should.be.true;
    });
});