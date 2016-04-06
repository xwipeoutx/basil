import { Test, TestPlugin, TestFunction, TestRunner } from "./basil";
export interface BrowserPlugin extends TestPlugin {
    pageRender(header: HTMLElement, results: HTMLElement): void;
    testRender(testElement: HTMLElement, test: Test): void;
    onComplete(): void;
}
export declare class BrowserRunner extends TestRunner {
    private _resultsElement;
    private _browserPlugins;
    private _completedTimeout;
    private isPageRendered;
    private renderPage();
    runTest(name: string, fn: TestFunction): Test;
    private appendResults(el, tests);
    private createTestElement(test);
    private complete();
    registerBrowserPlugins(plugins: BrowserPlugin[]): void;
}
