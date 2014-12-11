/// <reference path="TestRunner.ts" />
/// <reference path="dom-utils.ts" />

interface BrowserPlugin {
    pageRender(browserRunner : BrowserRunner, header : HTMLElement, results : HTMLElement) : void
    testRender(testElement : HTMLElement, test : Test) : void
    onComplete() : void
}

class BrowserRunner extends TestRunner {
    private _resultsElement : HTMLElement;
    private _browserPlugins : BrowserPlugin[] = [];
    private _completedTimeout : number = null;

    start() : void {
        this.renderPage();

        super.start();
    }

    private renderPage() {
        var header = appendElement(document.body, 'div', {
            id: 'basil-header'
        });

        var results = this._resultsElement = appendElement(document.body, 'div', {
            id: 'basil-results'
        });

        this._browserPlugins.forEach(plugin => plugin.pageRender(this, header, results))
    }

    _runTest(name : string, fn : TestFunction) : Test { // public
        var test = super._runTest(name, fn);

        clearTimeout(this._completedTimeout);
        this._completedTimeout = setTimeout(() => this.complete(), 10);

        if (test.isComplete)
            this.appendResults(this._resultsElement, [test]);

        return test;
    }

    private appendResults(el : HTMLElement, tests : Test[]) {
        tests = tests.filter(function(t) { return !t.wasSkipped; });

        if (!tests.length)
            return;

        var ul = document.createElement('ul');
        ul.className = 'basil-test-group';
        tests.forEach((test, i) => {
            var li = this.createTestElement(test);
            this.appendResults(li, test.children);
            ul.appendChild(li);
        }, this);

        el.appendChild(ul);
    }

    private createTestElement(test : Test) : HTMLElement {
        var li = document.createElement('li');
        li.className = 'basil-test';

        this._browserPlugins.forEach(plugin => plugin.testRender(li, test));
        return li;
    }

    private complete() {
        this._browserPlugins.forEach(plugin => plugin.onComplete());
    }
}
