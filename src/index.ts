import { TestEvents } from "./runner";
import { events, testRunner } from "./spec";
import { NodeReporter } from "./node-reporter";
import * as glob from "glob";

export interface ReporterOptions {
    quiet?: boolean,
    showTree?: boolean,
    hideStack?: boolean
}

export interface Reporter {
    connect(events: TestEvents): void
    complete(): void
}

var specFiles: string[] = [];
var reporters: Reporter[] = [];

var reporterOptions: ReporterOptions = {};

export function reporter(reporter: Reporter) {
    reporters.push(reporter);
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
    reporters.forEach(r => r.connect(events));
    specFiles.forEach(specFile => require(specFile));
    reporters.forEach(r => r.complete());
    
    if (testRunner.failed.length > 0) {
        process.exit(2);
    } else {
        process.exit(0);
    }
}