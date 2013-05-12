sinon.config = {
    injectIntoThis: true,
    injectInto: null,
    properties: ["assert", "spy", "stub", "mock", "clock", "sandbox"],
    useFakeTimers: true,
    useFakeServer: false
};

Basil.TestRunner.prototype.registerSetupPlugin(function(test, fn, runTest) {
    runTest(test, sinon.test(fn));
});