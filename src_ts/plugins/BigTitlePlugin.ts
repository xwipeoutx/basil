class BigTitlePlugin implements BrowserPlugin {
    constructor(private location : Location) {

    }

    setup(test:Test, go:TestFunction) {
    }

    test(test:Test, go:TestFunction) {
    }

    pageRender(browserRunner:BrowserRunner, header:HTMLElement, results:HTMLElement):void {
        var title = document.createElement('a');
        title.href = this.location.href.replace(location.search, '');
        title.textContent = document.title || 'Basil';

        header.appendChild(title);
    }

    testRender(testElement:HTMLElement, test:Test):void {
    }

    onComplete():void {
    }
}
