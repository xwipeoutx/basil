class ErrorTextPlugin implements  BrowserPlugin {
    setup(test:Test, go:TestFunction) {
    }

    test(test:Test, go:TestFunction) {
    }

    pageRender(browserRunner:BrowserRunner, header:HTMLElement, results:HTMLElement):void {
    }

    testRender(testElement:HTMLElement, test:Test):void {
        if (test.error) {
            var errorElement = appendElement(testElement, 'pre');
            appendText(errorElement, test.error);
        }
    }

    onComplete():void {
    }
}