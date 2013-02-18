describe("Assertions", function() {
    it("runs on any test assertion library", function() {
        expect(chai).to.not.be.undefined;
    });
});

describe("Mocking", function() {
    var sampleFunc = this.stub();
    sampleFunc();

    it("provides an adapter for SinonJS", function() {
        expect(sampleFunc).to.have.been.called;
    });

    it("is simple to adapt in any other mocking framework", function(){ });
});

describe("Nested test setup", function() {
    when("a variable is declared", function() {
        var variable = "initially declared value";

        then("it can be asserted on in a test", function() {
            expect(variable).to.equal("initially declared value");
        });

        when("the variable is changed", function() {
            variable = "changed value";

            then("the new value can be asserted on", function() {
                expect(variable).to.equal("changed value");
            })
        });

        it("has not run previous test setups", function() {
            expect(variable).to.equal("initially declared value");
        });

        variable = null;

        it("runs additional code", function() {
            expect(variable).to.be.null;
        });

        when("there", function() {
            var codeReadability = "no ";

            when("is", function() {
                codeReadability += "nonsense ";

                when("a lot of", function() {
                    codeReadability += "and ";

                    when("nested", function() {
                        codeReadability += "easily "

                        when("setup", function() {
                            codeReadability += "read.";

                            then(function() { expect(codeReadability).to.equal("no nonsense and easily read.")})
                        });
                    });
                });
            });
        });
    });
});

describe("Test names", function() {
    when("a name is supplied", function() {
        then("supplied test name is used", function() { });
    });

    when("no name is supplied", function() {
        var testName = "contents of function";
        then(function() {
            expect(testName).to.equal("contents of function");
        });
    })
});

describe("Failures", function() {
    when("a test failure", function() {
        it("can be inspected", function() {
            expect("inspected location").to.equal("this failed expectation")
        });

        then("code can be seen", function() {
            expect("failed assertion code").to.equal("this line of code");
        });

        when("in a browser", function() {
            then("favicon is updated to a failed one", function() {});
        });
    });

    when("an Error is thrown", function() {
        throw new Error("Example error");

        it("does not make it to subsequent tests", function() {
            expect("made it here").to.equal(false);
        });
    });

    when("in a later test", function() {
        then("previous failures do not affect it", function() {});
    });
});

module("QUnit Adapter");
test("qunit style tests run", function() { });
test("assertions are converted to their chai equivalent", function() {
    ok(true);
});