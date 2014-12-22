class InspectPlugin implements BrowserPlugin {
    setup(test:Test, go:TestFunction) {
    }

    test(test:Test, go:TestFunction) {
    }

    pageRender(browserRunner:BrowserRunner, header:HTMLElement, results:HTMLElement):void {
    }

    testRender(testElement:HTMLElement, test:Test):void {
        if (!test.inspect)
            return;

        var inspectElement = appendElement(testElement, 'i', {
            className: 'basil-icon basil-button icon-signin',
            title: 'Inspect'
        });

        inspectElement.addEventListener('click', () => test.inspect());
    }

    onComplete():void {
    }
}