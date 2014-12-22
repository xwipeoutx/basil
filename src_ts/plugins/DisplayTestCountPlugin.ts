class DisplayTestCountPlugin implements BrowserPlugin {
    passed : HTMLSpanElement;
    failed : HTMLSpanElement;
    total: HTMLSpanElement;
    originalTitle : string;

    constructor(private browserRunner : BrowserRunner) {

    }

    setup(test:Test, go:TestFunction) {
        go();

        var counts = this.browserRunner.counts;

        this.passed.textContent = counts.passed;
        this.failed.textContent = counts.failed;
        this.total.textContent = counts.total;

        document.title = "[" + counts.passed + '/' + counts.failed + '/' + counts.total + "] " + this.originalTitle;
    }

    test(test:Test, go:TestFunction) {
    }

    pageRender(browserRunner:BrowserRunner, header:HTMLElement, results:HTMLElement):void {
        this.originalTitle = document.title;

        var container = document.createElement('div');
        this.passed.classList.add('basil-summary');
        header.appendChild(this.passed);

        this.passed = document.createElement('span');
        this.passed.classList.add('basil-passes');
        container.appendChild(this.passed);

        container.appendChild(document.createTextNode('/'));

        this.failed = document.createElement('span');
        this.failed.classList.add('basil-fails');
        container.appendChild(this.failed);

        container.appendChild(document.createTextNode('/'));

        this.total = document.createElement('span');
        this.total.classList.add('basil-total');
        container.appendChild(this.total);
    }

    testRender(testElement:HTMLElement, test:Test):void {
    }

    onComplete():void {
    }

}