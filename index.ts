import * as nodeRunner from "./src/basilNode";

nodeRunner.hookNodeListeners();

require("./test/ideal");

nodeRunner.writeSummary();

if (nodeRunner.hasErrors()) {
    process.exit(2);
} else {
    process.exit(0);
}
