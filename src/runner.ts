export class TestRunner {
    private _testQueue: Test[] = [];
    private _rootTests: Test[] = [];
    private _aborted: boolean = false;
    private _outerTest: Test = null;
    private _leafTest: Test = null;

    constructor(private events: TestEvents) {        
    }

    abort(): void {
        this._aborted = true;
    }

    runTest(name: string, fn: Function): Test {
        if (this._aborted)
            return null;
            
        var test = this._createTest(name);

        if (this._outerTest)
            this._continueRun(test, fn);
        else
            this._startRun(test, fn);

        return test;
    }

    _createTest(name: string): Test {
        var test = this._outerTest
            ? this._outerTest.child(name)
            : new Test(name, null);

        if (!test.isDiscovered) {
            test.isDiscovered = true;
            this.events.nodeFound.next(test);
        }

        return test;
    }

    _startRun(test: Test, testFunction: Function): void {
        this._rootTests.push(test);
        this.events.rootStarted.next(test);

        while (!test.isComplete) {
            this._leafTest = null;
            this._continueRun(test, testFunction);
            this.events.leafComplete.next(this._leafTest);
        }

        this.events.rootComplete.next(test);
    }

    _continueRun(test: Test, testFunction: Function): void {
        if (test.isComplete || this._leafTest != null)
            return;

        this._runTestFunction(test, testFunction);
    }

    _runTestFunction(test: Test, testFunction: Function) {
        var outerTest = this._outerTest;
        this._outerTest = test;

        this.events.nodeEntered.next(test);
        test.run(testFunction);
        this.events.nodeExited.next(test);

        this._outerTest = outerTest;

        if (test.isComplete && !test.children.length && !test.wasSkipped)
            this._leafTest = test
    }

    private recordCompletion(test: Test) {
        this.events.leafComplete.next(test);

        this.leaves.push(test);
        if (test.hasPassed)
            this.passed.push(test);
        else
            this.failed.push(test);
    }

    get tests(): Test[] {
        return this._rootTests;
    }

    leaves: Test[] = [];
    passed: Test[] = [];
    failed: Test[] = [];
}

export class Test {
    private _runCount: number = 0;
    private _children: any; // NOCOMMIT should be a map or something
    private _error: Error = null;
    private _skipped: boolean = false;
    private _isComplete: boolean = false;
    private _inspect: Function = null;

    isDiscovered = false;

    constructor(private _name: string, private _parent: Test) {
        this._children = {};
    }

    get name(): string {
        return this._name;
    }

    get key(): string {
        return this._name.toLowerCase().replace(/>/g, '');
    }

    get fullKey(): string {
        return this._parent
            ? this._parent.fullKey + '>' + this.key
            : this.key;
    }

    get isComplete(): boolean {
        return this._skipped
            || this._isComplete
            || (this._isComplete = this._runCount > 0
                && this.children.every(child => child.isComplete));
    }

    run(fn: Function): void {
        if (this._skipped)
            return;

        try {
            fn();
        } catch (error) {
            if (!(error instanceof Error))
                error = new Error(error);
            this._error = error;
            this._inspect = fn;
        }
        this._runCount++;
    }

    skip(): void {
        this._skipped = true;
    }

    get wasSkipped(): boolean {
        return this._skipped;
    }

    get runCount(): number {
        return this._runCount;
    }

    hasChild(name: string): boolean {
        return !!this._children[name];
    }

    child(name: string): Test {
        if (this.hasChild(name))
            return this._children[name];

        return this._children[name] = new Test(name, this);
    }

    get children(): Array<Test> {
        return Object.keys(this._children)
            .map(key => this._children[key]);
    }

    get hasPassed(): boolean {
        return this.isComplete
            && this.children.every(child => child.hasPassed)
            && this._error == null;
    }

    get error(): Error {
        return this._error;
    }

    inspect(): void {
        debugger;
        this._inspect(); // Step into this
    }

    get code(): string {
        return this._inspect ? this._inspect.toString() : null;
    }
}

export class EventStream<T> {
    private callbacks: ((event: T) => void)[] = []
    subscribe(callback: (event: T) => void) {
        
        this.callbacks.push(callback);
    }

    next(event: T) {
        this.callbacks.forEach(cb => cb(event));
    }
}

export class TestEvents {
    rootStarted = new EventStream<Test>();
    rootComplete = new EventStream<Test>();

    nodeFound = new EventStream<Test>();
    nodeEntered = new EventStream<Test>();
    nodeExited = new EventStream<Test>();

    leafComplete = new EventStream<Test>();
}