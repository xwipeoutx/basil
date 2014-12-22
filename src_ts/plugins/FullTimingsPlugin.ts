class FullTimingsPlugin implements BrowserPlugin {
    private timingElement : HTMLElement;
    private timingFluid : HTMLElement;
    private timingValue : HTMLElement;
    private start : Number;
    private previous : Number;

    constructor(private storage : WindowLocalStorage, private location : Location, private getMs : () => Number ) {
        this.previous = parseInt(storage['basil-previous-timing-'] + location.href);
    }

    pageRender(browserRunner:BrowserRunner, header:HTMLElement, results:HTMLElement):void {
        this.timingElement = document.createElement('span');
        this.timingElement.classList.add('basil-full-timing');
        this.timingElement.title = 'Previous: ' + this.timeString(this.previous);
        header.appendChild(this.timingElement);

        this.timingFluid = document.createElement('span');
        this.timingFluid.classList.add('basil-full-timing-fluid');
        this.timingElement.appendChild(this.timingFluid);

        this.timingValue = document.createElement('span');
        this.timingValue.classList.add('basil-full-timing-value');
        this.timingElement.appendChild(this.timingValue);

        this.start = this.getMs();
    }

    private timeString(ms : Number) : string {
        if (!ms)
            return 'Unknown';

        if (ms < 5000)
            return Math.floor(ms) + 'ms';
        else
            return Math.floor(ms/1000) + 's';
    }

    testRender(testElement:HTMLElement, test:Test):void {
    }

    setup(test:Test, go:TestFunction) {
        go();
        this._updateTime();
    }

    test(test:Test, go:TestFunction) {
        go();
        this._updateTime();
    }

    onComplete():void {
        var elapsed = this.getMs() - this.start;
        this.elapsed = elapsed;
    }

    set elapsed(value : Number) : void {
        this.storage['basil-previous-timing-' + this.location.href] = value;
    }

    _updateTime() : void {
        var elapsed = this.getMs() - this.start;
        this.elapsed = elapsed;
        addClass(this.timingElement, 'elapsed-time');

        this.timingFluid.style.width = this.fluidWidth(elapsed);

        if (elapsed > this.previous)
            addClass(this.timingFluid, 'is-basil-full-timing-slower')

        this.timingValue.innerText = this.timeString(elapsed);
    }

    fluidWidth(current : Number) : string {
        return (Math.floor(current*100 / this.previous)) + 'px';
    }
}