export declare class PluginDidNotDelegateError {
    message: string;
}
export interface TestPlugin {
    setup(test: Test, go: TestFunction): void;
    test(test: Test, go: TestFunction): void;
}
export interface TestFunction {
    (): void;
}
export declare class TestRunner {
    private events;
    private _plugins;
    private _testQueue;
    private _rootTests;
    private _aborted;
    private _outerTest;
    private _branchHasBeenRun;
    constructor(events: TestEvents);
    abort(): void;
    runTest(name: string, fn: TestFunction): Test;
    _createTest(name: string): Test;
    _startRun(test: Test, testFunction: TestFunction): void;
    _continueRun(test: Test, testFunction: TestFunction): void;
    runStack(onComplete: TestFunction, runPlugin: (plugin: TestPlugin, go: TestFunction) => void): void;
    _runTestFunction(test: Test, testFunction: TestFunction): void;
    private recordCompletion(test);
    tests: Test[];
    registerPlugin(...plugins: TestPlugin[]): void;
    leaves: Test[];
    passed: Test[];
    failed: Test[];
}
export declare class Test {
    private _name;
    private _parent;
    private _context;
    private _runCount;
    private _children;
    private _error;
    private _skipped;
    private _isComplete;
    private _inspect;
    private _inspectContext;
    constructor(_name: string, _parent: Test, _context: any);
    name: string;
    key: string;
    fullKey: string;
    isComplete: boolean;
    run(fn: () => void): void;
    skip(): void;
    wasSkipped: boolean;
    runCount: number;
    child(name: string): Test;
    children: Array<Test>;
    hasPassed: boolean;
    error: string;
    inspect(): void;
    code: string;
    thisValue: any;
}
export declare class EventStream<T> {
    private callbacks;
    subscribe(callback: (event: T) => void): void;
    next(event: T): void;
}
export declare class TestEvents {
    rootStarted: EventStream<Test>;
    rootComplete: EventStream<Test>;
    nodeFound: EventStream<Test>;
    nodeEntered: EventStream<Test>;
    nodeExited: EventStream<Test>;
    leafComplete: EventStream<Test>;
}
export declare var events: TestEvents;
export declare var testRunner: TestRunner;
export declare function test(name: string, fn: TestFunction): void;
export declare var describe: typeof test;
export declare var when: typeof test;
export declare var then: typeof test;
export declare var it: typeof test;
