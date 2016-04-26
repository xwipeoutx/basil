"use strict";
var basil_1 = require("../src/basil");
basil_1.describe("Assertions", function () {
    basil_1.it("runs on any test assertion library", function () {
    });
});
basil_1.describe("Mocking", function () {
    //var sampleFunc = this.stub();
    //sampleFunc();
    basil_1.it("provides an adapter for SinonJS", function () {
    });
    basil_1.it("is simple to adapt in any other mocking framework", function () { });
});
basil_1.describe("Nested test setup", function () {
    basil_1.when("a variable is declared", function () {
        var variable = "initially declared value";
        basil_1.then("it can be asserted on in a test", function () {
        });
        basil_1.when("the variable is changed", function () {
            variable = "changed value";
            basil_1.then("the new value can be asserted on", function () {
            });
        });
        basil_1.it("has not run previous test setups", function () {
        });
        variable = null;
        basil_1.it("runs additional code", function () {
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
                            basil_1.then("assert", function () { });
                        });
                    });
                });
            });
        });
    });
});
basil_1.describe("Test names", function () {
    basil_1.when("a name is supplied", function () {
        basil_1.then("supplied test name is used", function () { });
    });
    basil_1.when("no name is supplied", function () {
        var testName = "contents of function";
        basil_1.then(testName, function () {
        });
    });
});
basil_1.describe("Failures", function () {
    basil_1.when("a test failure", function () {
        basil_1.it("can be inspected", function () {
            throw new Error("Error message");
        });
        basil_1.then("code can be seen", function () {
            throw new Error("Error message");
        });
        basil_1.when("in a browser", function () {
            basil_1.then("favicon is updated to a failed one", function () { });
        });
    });
    basil_1.when("an Error is thrown", function () {
        throw new Error("Example error");
        basil_1.it("does not make it to subsequent tests", function () {
            throw new Error("Error message");
        });
    });
    basil_1.when("in a later test", function () {
        basil_1.then("previous failures do not affect it", function () { });
    });
});
basil_1.describe("DOM fixture", function () {
    basil_1.it("provides an attached dom element", function () {
    });
    basil_1.it("uses a new element per setup", function () {
    });
    basil_1.it("cleans up the dom element when done", function () {
    });
});
