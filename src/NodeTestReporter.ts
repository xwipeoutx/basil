/// <reference path="../typings/main.d.ts" />
import * as basil from "./basil";
import * as col from "cli-color"

export class NodeTestReporter {
    private numTests: number = 0
    private numPassed: number = 0
    private numFailed: number = 0

    private loadingIndicators = ['|', '/', '-', '\\']
    private loadingIndex = 0;
    private depths: { [key: string]: number } = {};
    private depth = 1;

    constructor(private testEvents: basil.TestEvents) {

        testEvents.leafComplete.subscribe(test => {
            this.numTests++;
            if (test.hasPassed)
                this.numPassed++;
            else
                this.numFailed++;
        })

        testEvents.nodeEntered.subscribe(test => {
            var loadingIndicator = this.loadingIndicators[this.loadingIndex];
            this.loadingIndex = (this.loadingIndex + 1) % this.loadingIndicators.length;

            console.log(col.move(0, -1) + loadingIndicator);
            this.depth++;
        });
        testEvents.nodeExited.subscribe(test => this.depth--);

        testEvents.rootStarted.subscribe(test => console.log(this.spaces() + test.name));
        testEvents.rootComplete.subscribe(test => {
            console.log(col.move(0, -2));
            this.writeStatus(test, this.depth);
        });
    }

    private writeStatus(test: basil.Test, depth: number) {
        var color = test.hasPassed ? col.green : col.red;
        var indicator = test.hasPassed ? "√" : "×";

        console.log(color(this.spaces(depth - 1) + indicator + " " + color(test.name)));

        if (test.hasPassed)
            return;

        if (test.error != null) {
            console.log(this.spaces(depth) + col.yellow("> " + test.error.stack));
        }

        test.children.forEach(t => this.writeStatus(t, depth + 1));
    }

    private spaces(numSpaces?: number) {
        if (numSpaces == null)
            numSpaces = this.depth;
        return new Array(numSpaces + 1).join("  ")
    }

    get hasErrors() { return this.numFailed > 0 || this.numTests == 0; }

    writeSummary() {
        console.log();
        if (this.numFailed > 0) {
            console.log(col.red("Test run Failed"));
        } else if (this.numTests == 0) {
            console.log(col.yellow("No tests run"));
        } else {
            console.log(col.green("Test run Succeeded"));
        }

        var totalText = this.numTests > 0
            ? this.numTests.toString() + " tests"
            : col.yellow("0 tests");

        var passedText = this.numPassed > 0
            ? col.green(this.numPassed.toString() + " passed")
            : col.yellow("0 passed");

        var failedText = this.numFailed > 0
            ? col.red(this.numFailed.toString() + " failed")
            : this.numTests > 0 ? col.green("0 failed") : col.yellow("0 failed");

        console.log(`${totalText} | ${passedText} | ${failedText}`);
    }
}