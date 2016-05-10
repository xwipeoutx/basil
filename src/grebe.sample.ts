import * as grebe from "./index";
import { ConsoleReporter } from "./reporters/console"

grebe.reporter(new ConsoleReporter({
    hideStack: true,
    showTree: true
}))

grebe.spec("dist/sample/*.spec.js");