import * as nodeRunner from "./src/basilNode";
var glob = require("glob");

nodeRunner.hookNodeListeners();

glob("test/**/*.js", {
    realPath: true
}, (err: string, files: string[]) => {
    files.forEach(f => require('./' + f));

    nodeRunner.writeSummary();
    
    if (nodeRunner.hasErrors()) {
        process.exit(2);
    } else {
        process.exit(0);
    }
});