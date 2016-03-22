/// <reference path="../typings/main.d.ts" />
import * as basil from "./basil";
import * as col from "cli-color"

export function hasErrors() {
    return basil.testRunner.leaves.length == 0
        || basil.testRunner.failed.length > 0;
}

export function writeSummary() {
    console.log();
    if (basil.testRunner.failed.length > 0) {
        console.log(col.red("Test run Failed"));
    } else if (basil.testRunner.leaves.length == 0) {
        console.log(col.yellow("No tests run"));
    } else {
        console.log(col.green("Test run Succeeded"));
    }

    var totalText = basil.testRunner.leaves.length > 0
        ? basil.testRunner.leaves.length.toString() + " tests"
        : col.yellow("0 tests");

    var passedText = basil.testRunner.passed.length > 0
        ? col.green(basil.testRunner.passed.length.toString() + " passed")
        : col.yellow("0 passed");

    var failedText = basil.testRunner.failed.length > 0
        ? col.red(basil.testRunner.failed.length.toString() + " failed")
        : basil.testRunner.leaves.length > 0 ? col.green("0 failed") : col.yellow("0 failed");

    console.log(`${totalText} | ${passedText} | ${failedText}`);
}

export function hookNodeListeners() {
    var depths: { [key: string]: number } = {};
    var depth = 1;
    var loadingIndicators = ['|', '/', '-', '\\']
    var loadingIndex = 0;

    basil.events.nodeEntered.subscribe(test => {
        var loadingIndicator = loadingIndicators[loadingIndex];
        loadingIndex = (loadingIndex+1)%loadingIndicators.length;
        
        console.log(col.move(0, -1) + loadingIndicator);
        depth++;
    });
    basil.events.nodeExited.subscribe(test => depth--);

    basil.events.rootStarted.subscribe(test => console.log(spaces() + test.name));
    basil.events.rootComplete.subscribe(test => {
        console.log(col.move(0, -2));
        writeStatus(test, depth);
    });

    function writeStatus(test: basil.Test, depth: number) {
        var color = test.hasPassed ? col.green : col.red;
        var indicator = test.hasPassed ? "√" : "×";

        console.log(color(spaces(depth-1) + indicator + " " + color(test.name)));

        if (test.hasPassed)
            return;

        if (test.error != null) {
            console.log(spaces(depth) + col.yellow("> " + test.error));
        }

        test.children.forEach(t => writeStatus(t, depth + 1));
    }

    function spaces(numSpaces?: number) {
        if (numSpaces == null)
            numSpaces = depth;
        return new Array(numSpaces + 1).join("  ")
    }
}