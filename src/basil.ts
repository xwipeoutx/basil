export class PluginDidNotDelegateError {
    public message: string = "A registered plugin did not delegate";
}

export interface TestPlugin {
    setup(test: Test, go: TestFunction): void
    test(test: Test, go: TestFunction): void
}

export interface TestFunction {
    (): void
}

interface PluginFunction {
    (test: Test, go: TestFunction): void
}

export class TestRunner {
    private _plugins: Array<TestPlugin> = [];
    private _testQueue: Test[] = [];
    private _rootTests: Test[] = [];
    private _aborted: boolean = false;
    private _outerTest: Test = null;
    private _branchHasBeenRun: boolean = false;

    constructor(private events: TestEvents) {
    }

    abort(): void {
        this._aborted = true;
    }

    runTest(name: string, fn: TestFunction): Test {
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
        return this._outerTest
            ? this._outerTest.child(name)
            : new Test(name, null, {});
    }

    _startRun(test: Test, testFunction: TestFunction): void {
        this._rootTests.push(test);
        this.events.rootStarted.next(test);
        
        while (!test.isComplete) {
            this._branchHasBeenRun = false;
            this._continueRun(test, testFunction)
            /*
            //!!!!!!!!!!!!!!!!!! TFSBAD put test context back here, or it gets reused with parents.
            this.runStack(
                () => this._continueRun(test, testFunction),
                (plugin, runNext) => plugin.setup(test, runNext)
            );
            */
        }
        
        this.events.rootComplete.next(test);
    }

    _continueRun(test: Test, testFunction: TestFunction): void {
        if (test.isComplete || this._branchHasBeenRun) {
            return;
        }
        
        for (var i=0;i<200000000;i++)
          i = i + 1 - 1;
        this._runTestFunction(test, testFunction);
        
        this._branchHasBeenRun = true;
    }

    runStack(onComplete: TestFunction, runPlugin: (plugin: TestPlugin, go: TestFunction) => void) {
        var pluginsRun: TestPlugin[] = [];
        var pluginsCopy = this._plugins.slice(0);
        var allPluginsRan = false;

        runNextPlugin();

        if (!allPluginsRan)
            throw new PluginDidNotDelegateError();

        function runNextPlugin() {
            if (pluginsCopy.length > 0) {
                var plugin = pluginsCopy.pop();
                pluginsRun.push(plugin);
                runPlugin(plugin, runNextPlugin);
            } else {
                onComplete();
                allPluginsRan = true
            }
        }

    }

    _runTestFunction(test: Test, testFunction: TestFunction) {
        if (test.isComplete || this._branchHasBeenRun)
            return;
            
        if (test.runCount == 0)
            this.events.nodeFound.next(test);

        var outerTest = this._outerTest;
        this._outerTest = test;

        this.events.nodeEntered.next(test);
        
        test.run(testFunction);
        this.events.nodeExited.next(test);
        
        if (test.isComplete && !test.children.length && !test.wasSkipped)
            this.recordCompletion(test)

        this._outerTest = outerTest;
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

    registerPlugin(...plugins: TestPlugin[]): void {
        for (var i = 0; i < plugins.length; i++)
            this._plugins.push(plugins[i]);
    }

    leaves: Test[] = [];
    passed: Test[] = [];
    failed: Test[] = [];
}

export class Test {
    private _runCount: number = 0;
    private _children: any; // NOCOMMIT should be a map or something
    private _error: string = null;
    private _skipped: boolean = false;
    private _isComplete: boolean = false;
    private _inspect: (context: Object) => void = null;
    private _inspectContext: any = null;

    constructor(private _name: string, private _parent: Test, private _context: any) {
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

    run(fn: () => void): void {
        if (this._skipped)
            return;

        try {
            fn.call(this._context);
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

    child(name: string): Test {
        if (this._children[name])
            return this._children[name];

        return this._children[name] = new Test(name, this, {});
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

    get error(): string {
        return this._error;
    }

    inspect(): void {
        debugger;
        this._inspect(this._context); // Step into this
    }

    get code(): string {
        return this._inspect ? this._inspect.toString() : null;
    }

    get thisValue(): any {
        return this._context;
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

export var events = new TestEvents();
export var testRunner = new TestRunner(events);

export function test(name: string, fn: TestFunction) {
    testRunner.runTest(name, fn);
}

export var describe = test;
export var when = test;
export var then = test;
export var it = test;