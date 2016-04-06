// <reference path="../typings/browser.d.ts" />
import { Test, TestPlugin, TestFunction, TestRunner } from "./basil"

export interface BrowserPlugin extends TestPlugin {
    pageRender(header: HTMLElement, results: HTMLElement): void
    testRender(testElement: HTMLElement, test: Test): void
    onComplete(): void
}

export class BrowserRunner extends TestRunner {
    private _resultsElement: HTMLElement;
    private _browserPlugins: BrowserPlugin[] = [];
    private _completedTimeout: number = null;
    private isPageRendered = false;

    // public test(name: string, fn: TestFunction): Test {
    //     if (!this.isPageRendered)
    //         this.renderPage();

    //     var test = super.test(name, fn);

    //     clearTimeout(this._completedTimeout);
    //     this._completedTimeout = setTimeout(() => this.complete(), 10);

    //     if (test.isComplete)
    //         this.appendResults(this._resultsElement, [test]);

    //     return test;
    // }

    private renderPage() {
        var header = appendElement(document.body, 'div', {
            id: 'basil-header'
        });

        var results = this._resultsElement = appendElement(document.body, 'div', {
            id: 'basil-results'
        });

        this._browserPlugins.forEach(plugin => plugin.pageRender(header, results));
        this.isPageRendered = true;
    }

    runTest(name: string, fn: TestFunction): Test {
        var test = super.runTest(name, fn);

        clearTimeout(this._completedTimeout);
        this._completedTimeout = <number><any>setTimeout(() => this.complete(), 10); // <number><any> because of stupid node types

        if (test.isComplete)
            this.appendResults(this._resultsElement, [test]);

        return test;
    }

    private appendResults(el: HTMLElement, tests: Test[]) {
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

    private createTestElement(test: Test): HTMLElement {
        var li = document.createElement('li');
        li.className = 'basil-test';

        this._browserPlugins.forEach(plugin => plugin.testRender(li, test));
        return li;
    }

    private complete() {
        this._browserPlugins.forEach(plugin => plugin.onComplete());
    }

    registerBrowserPlugins(plugins: BrowserPlugin[]): void {
        for (var i = 0; i < plugins.length; i++) {
            this._browserPlugins.push(plugins[i]);
            super.registerPlugin(plugins[i]);
        }
    }
}