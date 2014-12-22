class TimingsPlugin implements BrowserPlugin {
    private timings = {};

    constructor(private getMs:() => Number) {
    }

    setup(test:Test, go:TestFunction) {
    }

    test(test:Test, go:TestFunction) {
        var start = this.getMs();
        go();
        var timeSoFar = this.timings[test.fullKey] || 0;

        var inclusiveTime = timeSoFar + Math.floor(this.getMs() - start);

        this.timings[test.fullKey] = inclusiveTime;
    }

    pageRender(browserRunner:BrowserRunner, header:HTMLElement, results:HTMLElement):void {
    }

    testRender(testElement:HTMLElement, test:Test):void {
        var timingsElement = document.createElement('span');
        timingsElement.classList.add('basil-test-timing');
        timingsElement.textContent = this.timings[test.fullKey] + 'ms';
        testElement.appendChild(timingsElement);
        addClass(timingsElement, 'basil-test-timing');
    }

    onComplete():void {
    }
}