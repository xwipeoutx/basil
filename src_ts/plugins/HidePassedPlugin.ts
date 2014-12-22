class HidePassedPlugin implements  BrowserPlugin {
    constructor(private localStorage : WindowLocalStorage) {
    }

    setup(test:Test, go:TestFunction) {
    }

    test(test:Test, go:TestFunction) {
    }

    pageRender(browserRunner:BrowserRunner, header:HTMLElement, results:HTMLElement):void {
        var label = appendElement(header, 'label', { className: 'basil-hide-passed basil-header-section' });

        var checkbox = <HTMLInputElement>appendElement(label, 'input', {
            type: 'checkbox',
            checked: this.shouldHidePassed
        });

        appendText(label, 'Hide Passed');

        updateHidePassedState();

        checkbox.addEventListener('change', updateHidePassedState);

        function updateHidePassedState () {
            this.shouldHidePassed = checkbox.checked;

            if (checkbox.checked)
                addClass(results, 'is-hiding-passed');
            else
                removeClass(results, 'is-hiding-passed');
        }
    }

    get shouldHidePassed()  : boolean {
        return this.localStorage['basil-hide-passed'] == true.toString;
    }
    set shouldHidePassed(value : boolean) : void {
        this.localStorage['basil-hide-passed'] = value.toString;
    }

    testRender(testElement:HTMLElement, test:Test):void {
        addClass(testElement, test.hasPassed ? 'is-passed' : 'is-failed');
    }

    onComplete():void {
    }
}