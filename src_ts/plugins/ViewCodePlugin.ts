class ViewCodePlugin implements BrowserPlugin
{
    setup(test:Test, go:TestFunction) {
    }

    test(test:Test, go:TestFunction) {
    }

    pageRender(browserRunner:BrowserRunner, header:HTMLElement, results:HTMLElement):void {
    }

    testRender(testElement:HTMLElement, test:Test):void {
        if (!test.code)
            return;

        var codeIcon = appendElement(testElement, 'i', {
            className: 'basil-icon basil-button icon-code',
            title: 'View Code'
        });

        var code = appendElement(testElement, 'code', {
            innerHTML: test.code.toString().trim(),
            className: 'basil-code'
        });

        var isVisible = false;
        codeIcon.addEventListener('click', () => {
            isVisible = !isVisible;
            code.className = isVisible
                ? 'basil-code is-basil-code-visible'
                : 'basil-code';
        });
    }

    onComplete():void {
    }

}
