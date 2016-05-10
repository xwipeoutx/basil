import * as grebe from "./index";
import { ConsoleReporter } from "./reporters/console"

grebe.reporter(new ConsoleReporter())
grebe.spec("dist/test/*.spec.js");