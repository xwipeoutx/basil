import * as grebe from "./index";
import { NodeReporter } from "./node-reporter"

grebe.reporter(new NodeReporter())
grebe.spec("dist/test/*.spec.js");