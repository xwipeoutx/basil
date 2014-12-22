class PassedFailIconPlugin implements BrowserPlugin
{
    setup(test:Test, go:TestFunction) {
    }

    test(test:Test, go:TestFunction) {
    }

    pageRender(browserRunner:BrowserRunner, header:HTMLElement, results:HTMLElement):void {
    }

    testRender(testElement:HTMLElement, test:Test):void {
        var icon = appendElement(testElement, 'i');
        icon.classList.add('basil-icon');
        icon.classList.add(test.hasPassed ? 'icon-ok' : 'icon-remove')
    }

    onComplete():void {
    }
}