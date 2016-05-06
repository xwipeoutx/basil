import { TestEvents } from "./runner";
export interface TestReporterOptions {
    quiet?: boolean;
    showTree?: boolean;
    hideStack?: boolean;
}
export declare class NodeTestReporter {
    private testEvents;
    private options;
    private numTests;
    private numPassed;
    private numFailed;
    private depths;
    private depth;
    constructor(testEvents: TestEvents, options?: TestReporterOptions);
    private writeStatus(test, depth);
    private spaces(numSpaces?);
    hasErrors: boolean;
    writeSummary(): void;
}
