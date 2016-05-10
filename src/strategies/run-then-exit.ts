import { TestEvents, TestRunner } from "../runner";
import { Reporter, Strategy } from "../index";

export class RunThenExitStrategy implements Strategy {
    run(reporter: Reporter, testRunner: TestRunner, events: TestEvents, specFiles: string[]) {
        reporter.connect(events);
        specFiles.forEach(specFile => require(specFile));
        reporter.complete();

        if (testRunner.failed.length > 0) {
            process.exit(2);
        } else {
            process.exit(0);
        }
    }
}