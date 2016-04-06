// import {describe, when, then, it} from "../src/basil";
// describe("Assertions", function() {
//     it("runs on any test assertion library", function() {
//     });
// });
// describe("Mocking", function() {
//     //var sampleFunc = this.stub();
//     //sampleFunc();
//     it("provides an adapter for SinonJS", function() {
//     });
//     it("is simple to adapt in any other mocking framework", function() { });
// });
// describe("Nested test setup", function() {
//     when("a variable is declared", function() {
//         var variable = "initially declared value";
//         then("it can be asserted on in a test", function() {
//         });
//         when("the variable is changed", function() {
//             variable = "changed value";
//             then("the new value can be asserted on", function() {
//             })
//         });
//         it("has not run previous test setups", function() {
//         });
//         variable = null;
//         it("runs additional code", function() {
//         });
//         when("there", function() {
//             var codeReadability = "no ";
//             when("is", function() {
//                 codeReadability += "nonsense ";
//                 when("a lot of", function() {
//                     codeReadability += "and ";
//                     when("nested", function() {
//                         codeReadability += "easily "
//                         when("setup", function() {
//                             codeReadability += "read.";
//                             then("assert", function() { })
//                         });
//                     });
//                 });
//             });
//         });
//     });
// });
// describe("Test names", function() {
//     when("a name is supplied", function() {
//         then("supplied test name is used", function() { });
//     });
//     when("no name is supplied", function() {
//         var testName = "contents of function";
//         then(testName, function() {
//         });
//     })
// });
// describe("Failures", function() {
//     when("a test failure", function() {
//         it("can be inspected", function() {
//             throw new Error("Error message");
//         });
//         then("code can be seen", function() {
//             throw new Error("Error message");
//         });
//         when("in a browser", function() {
//             then("favicon is updated to a failed one", function() { });
//         });
//     });
//     when("an Error is thrown", function() {
//         throw new Error("Example error");
//         it("does not make it to subsequent tests", function() {
//             throw new Error("Error message");
//         });
//     });
//     when("in a later test", function() {
//         then("previous failures do not affect it", function() { });
//     });
// });
// describe("DOM fixture", function() {
//     it("provides an attached dom element", function() {
//     });
//     it("uses a new element per setup", function() {
//     });
//     it("cleans up the dom element when done", function() {
//     });
// }); 
