class TestNamePlugin implements  BrowserPlugin {
    setup(test:Test, go:TestFunction) {
    }

    test(test:Test, go:TestFunction) {
    }

    pageRender(browserRunner:BrowserRunner, header:HTMLElement, results:HTMLElement):void {
    }

    testRender(testElement:HTMLElement, test:Test):void {
        appendText(testElement, test.name);
    }

    onComplete():void {
    }
}
