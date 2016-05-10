import * as grebe from "./index";
import { NodeReporter } from "./node-reporter"

grebe.reporter(new NodeReporter({
    hideStack: true,
    showTree: true
}))

grebe.spec("dist/sample/*.spec.js");