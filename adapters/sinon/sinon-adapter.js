sinon.config = {
    injectIntoThis: true,
    injectInto: null,
    properties: ["assert", "spy", "stub", "mock", "clock", "sandbox"],
    useFakeTimers: true,
    useFakeServer: false
};

(function (global) {
    var oldDescribe = describe;

    global.describe = function (testName, testFunction) {
        return oldDescribe(testName, sinon.test(testFunction));
    };
}(this));