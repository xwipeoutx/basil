import * as basil from "./src/basil";
import { NodeTestReporter } from "./src/nodeTestReporter";
var glob = require("glob");

var reporter = new NodeTestReporter(basil.events);

glob("test/**/*.js", {
    realPath: true
}, (err: string, files: string[]) => {
    files.forEach(f => require('./' + f));

    reporter.writeSummary();
    
    if (reporter.hasErrors) {
        process.exit(2);
    } else {
        process.exit(0);
    }
});