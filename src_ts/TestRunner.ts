/// <reference path="Test.ts" />
/// <reference path="Errors.ts" />

interface TestPlugin {
    setup(test : Test, go: TestFunction)
    test(test : Test, go: TestFunction)
}

interface TestFunction {
    () : void
}

interface PluginFunction {
    (test : Test, go : TestFunction) : void
}

class TestRunner {
    private _plugins : Array<TestPlugin> = []; // NOCOMMIT func
    private _testQueue : Test[] = [];
    private _rootTests : Test[] = [];
    private _started : boolean = false;
    private _aborted : boolean = false;
    private _outerTest : Test = null;
    private _branchHasBeenRun : boolean = false;
    private _context : any = {};

    test(name : string, fn : TestFunction) : void {
        // NOCOMMIT: NULL check
        if (this._started)
            this._runTest(name, fn);
        else
            this._testQueue.unshift(this._runTest.bind(this, name, fn));
    }

    start() : void {
        this._started = true;
        this._testQueue.forEach(function(fn) {
            setTimeout(fn, 1);
        });
    }

    abort() : void {
        this._aborted = true;
    }

    _runTest(name : string, fn : TestFunction) : Test { // public
        if (this._aborted)
            return null;

        var test = this._createTest(name);

        if (this._outerTest)
            this._continueRun(test, fn);
        else
            this._startRun(test, fn);

        return test;
    }

    _createTest(name : string) : Test {
        return this._outerTest
            ? this._outerTest.child(name)
            : new Test(name, null);
    }

    _startRun(test : Test, testFunction : TestFunction) : void {
        this._rootTests.push(test);
        while (!test.isComplete) {
            this._branchHasBeenRun = false;
            this._context = {};

            this.runStack(test,
                (test, fn) => this._continueRun(test, () => { testFunction(); fn() }),
                (plugin, test, runNext) => plugin.setup(test, runNext));
        }
    }

    _continueRun(test : Test, testFunction : TestFunction) : void {
        if (test.isComplete || this._branchHasBeenRun)
            return;

        this.runStack(test,
            (test, fn) => this._runTestFunction(test, () => { testFunction(); fn() }),
            (plugin, test, runNext) => plugin.test(test, runNext));

        this._branchHasBeenRun = true;
    }

    runStack(test : Test, innerMost : PluginFunction, runPlugin : (plugin : TestPlugin, test : Test, go : TestFunction) => void) {
        var pluginsCopy = this._plugins.slice(0);
        var allPluginsRan = false;

        runNextPlugin();

        if (!allPluginsRan)
            throw new PluginDidNotDelegateError();

        function runNextPlugin() {
            if (pluginsCopy.length > 0)
                runPlugin(pluginsCopy.pop(), test, runNextPlugin);
            else
                innerMost(test, () => allPluginsRan = true);
        }

    }

    _runTestFunction(test : Test, testFunction : TestFunction) {
        if (test.isComplete || this._branchHasBeenRun)
            return;

        var outerTest = this._outerTest;
        this._outerTest = test;
        test.run(testFunction, this._context);
        this._outerTest = outerTest;
    }

    get tests() : Test[] {
        return this._rootTests;
    }

    registerPlugin(...plugins : TestPlugin[]) : void {
        for (var i = 0; i < plugins.length; i++)
            this._plugins.push(plugins[i]);
    }
}
