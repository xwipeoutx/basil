import { TestEvents } from "../runner";
import { Reporter } from "../index";

export class CompositeReporter implements Reporter {
    reporters: Reporter[] = [];

    add(reporter: Reporter) {
        this.reporters.push(reporter);
    }

    connect(events: TestEvents) {
        this.reporters.forEach(r => r.connect(events));
    }

    complete() {
        this.reporters.forEach(r => r.complete());
    }
}