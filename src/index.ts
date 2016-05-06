import { events } from "./spec";
import { NodeTestReporter } from "./node-reporter";
import * as glob from "glob";

export interface ReporterOptions {
    quiet?: boolean,
    showTree?: boolean,
    hideStack?: boolean
}

var testFiles: string[] = [];
var reporterOptions: ReporterOptions = {};

export function test(globs: string[] | string) {
    var globsArray: string[] = (typeof globs == "string") ? [<string>globs] : <string[]>globs;
    var globOptions: glob.Options = {
        realpath: true
    };

    var initial: string[] = [];
    testFiles = globsArray.reduce((result, pattern) => result.concat(glob.sync(pattern, globOptions)), testFiles);
}

export function options(value: ReporterOptions) {
    reporterOptions = value;
}

export function run(globs: string[] | string, reporterOptions: ReporterOptions) {
    var reporter = new NodeTestReporter(events, reporterOptions);
    testFiles.forEach(f => {
        require(f);
    });
    reporter.writeSummary();

    if (reporter.hasErrors) {
        process.exit(2);
    } else {
        process.exit(0);
    }
}