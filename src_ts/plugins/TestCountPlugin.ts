/// <reference path="../TestRunner.ts" />

class TestCountPlugin implements TestPlugin {
    constructor(private testRunner : BrowserRunner) {
    }

    test(test:Test, go:TestFunction) {
    }

    setup(test:Test, go:TestFunction) {
        go();

        if (test.isComplete)
            countLeaves(test);

        function countLeaves(test) {
            var children = test.children();
            if (children.length)
                return children.forEach(countLeaves);

            if (!test.wasSkipped()) {
                this.testRunner.counts.total++;
                if (test.hasPassed())
                    this.testRunner.counts.passed++;
                else
                    this.testRunner.counts.failed++;
            }
        }
    }
}