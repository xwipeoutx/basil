var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseTestPlugin_1 = require("./BaseTestPlugin");
var FullTimingsPlugin = (function (_super) {
    __extends(FullTimingsPlugin, _super);
    function FullTimingsPlugin(storage, location, getMs) {
        _super.call(this);
        this.storage = storage;
        this.location = location;
        this.getMs = getMs;
        this.previous = parseInt(storage['basil-previous-timing-'] + location.href);
    }
    FullTimingsPlugin.prototype.pageRender = function (browserRunner, header, results) {
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
    };
    FullTimingsPlugin.prototype.timeString = function (ms) {
        if (!ms)
            return 'Unknown';
        if (ms < 5000)
            return Math.floor(ms) + 'ms';
        else
            return Math.floor(ms / 1000) + 's';
    };
    FullTimingsPlugin.prototype.testRender = function (testElement, test) {
    };
    FullTimingsPlugin.prototype.setup = function (test, go) {
        go();
        this._updateTime();
    };
    FullTimingsPlugin.prototype.test = function (test, go) {
        go();
        this._updateTime();
    };
    FullTimingsPlugin.prototype.onComplete = function () {
        var elapsed = this.getMs() - this.start;
        this.elapsed = elapsed;
    };
    Object.defineProperty(FullTimingsPlugin.prototype, "elapsed", {
        set: function (value) {
            this.storage['basil-previous-timing-' + this.location.href] = value;
        },
        enumerable: true,
        configurable: true
    });
    FullTimingsPlugin.prototype._updateTime = function () {
        var elapsed = this.getMs() - this.start;
        this.elapsed = elapsed;
        addClass(this.timingElement, 'elapsed-time');
        this.timingFluid.style.width = this.fluidWidth(elapsed);
        if (elapsed > this.previous)
            addClass(this.timingFluid, 'is-basil-full-timing-slower');
        this.timingValue.innerText = this.timeString(elapsed);
    };
    FullTimingsPlugin.prototype.fluidWidth = function (current) {
        return (Math.floor(current * 100 / this.previous)) + 'px';
    };
    return FullTimingsPlugin;
})(BaseTestPlugin_1.BaseTestPlugin);
