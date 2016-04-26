import * as basil from "./src/basil";
import { NodeTestReporter } from "./src/nodeTestReporter";
import * as program from "commander"
import * as glob from "glob";

program
    .version("0.1.1")
    .usage("<glob...>")
    .option("-t, --tree", "Show full test tree")
    .option("-h, --hide-stack", "Hide the stack trace")
    .option("-q, --quiet", "Hide all console output")
    .parse(process.argv);

var globs = program.args;

var globOptions: any = {
    realPath: true
};

var reporterOptions = {
    quiet: program.opts().quiet,
    showTree: program.opts().tree,
    hideStack: program.opts().hideStack
}

var initial: string[] = [];
var files = globs.reduce((result, pattern) => result.concat(glob.sync(pattern, globOptions)), initial);

var reporter = new NodeTestReporter(basil.events, reporterOptions);
files.forEach(f => require('./' + f));

reporter.writeSummary();

if (reporter.hasErrors) {
    process.exit(2);
} else {
    process.exit(0);
}