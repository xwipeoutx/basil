import { TestEvents, TestRunner } from "./runner";
import { RunThenExitStrategy } from "./strategies/run-then-exit";
import { CompositeReporter } from "./reporters/composite";
import { glebeSingleton } from "./singleton";
import * as glob from "glob";

export interface Reporter {
    connect(events: TestEvents): void
    complete(): void
}

export interface Strategy {
    run(reporter: Reporter, testRunner: TestRunner, events: TestEvents, specFiles: string[]): void
}

var specFiles: string[] = [];
var compositeReporter = new CompositeReporter();
var currentStrategy = new RunThenExitStrategy();

export function reporter(reporter: Reporter) {
    compositeReporter.add(reporter);
}

export function strategy(strategy: Strategy) {
    currentStrategy = strategy;
}

export function spec(globs: string[] | string) {
    var globsArray: string[] = (typeof globs == "string") ? [<string>globs] : <string[]>globs;
    var globOptions: glob.Options = {
        realpath: true
    };

    var initial: string[] = [];
    specFiles = globsArray.reduce((result, pattern) => result.concat(glob.sync(pattern, globOptions)), specFiles);
}

export function run() {
    currentStrategy.run(compositeReporter, glebeSingleton.testRunner, glebeSingleton.events, specFiles);
}