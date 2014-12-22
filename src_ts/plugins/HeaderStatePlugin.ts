class HeaderStatePlugin implements BrowserPlugin {
    private headerElement : HTMLElement;

    constructor(private testRunner : BrowserRunner) {
    }

    pageRender(browserRunner:BrowserRunner, header:HTMLElement, results:HTMLElement):void {
        this.headerElement = header;
        addClass(header, 'is-running');
    }

    testRender(testElement:HTMLElement, test:Test):void {
    }

    setup(test:Test, go:TestFunction) {
    }

    test(test:Test, go:TestFunction) {
    }

    onComplete():void {
        removeClass(this.headerElement, 'is-running');
        if (this.testRunner.counts.failed)
            addClass(this.headerElement, 'is-failed');
    }
}