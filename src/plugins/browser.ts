import { Test, TestFunction, TestPlugin, TestRunner } from "../basil"
import { BrowserPlugin } from "../BrowserRunner"

class BaseTestPlugin implements TestPlugin {
    setup(test:Test, go:TestFunction) {
        go();
    }

    test(test:Test, go:TestFunction) {
        go();
    }

    pageRender(header:HTMLElement, results:HTMLElement):void {
    }

    testRender(testElement:HTMLElement, test:Test):void {
    }

    onComplete():void {
    }
}

class BigTitlePlugin extends BaseTestPlugin implements BrowserPlugin {
    constructor(private location : Location) {
        super();
    }

    pageRender(header:HTMLElement, results:HTMLElement):void {
        var title = document.createElement('a');
        title.href = this.location.href.replace(location.search, '');
        title.textContent = document.title || 'Basil';
        title.id = 'basil-title';

        header.appendChild(title);
    }

    testRender(testElement:HTMLElement, test:Test):void {
    }

    onComplete():void {
    }
}

class DisplayTestCountPlugin extends BaseTestPlugin implements BrowserPlugin {
    passed : HTMLSpanElement;
    failed : HTMLSpanElement;
    total: HTMLSpanElement;
    originalTitle : string;

    constructor(private testRunner : TestRunner) {
        super();
    }

    setup(test:Test, go:TestFunction) {
        go();


        this.passed.textContent = this.testRunner.passed.length.toString();
        this.failed.textContent = this.testRunner.failed.toString();
        this.total.textContent = this.testRunner.leaves.toString();

        document.title = "[" + this.testRunner.passed + '/' + this.testRunner.failed + '/' + this.testRunner.leaves.length + "] " + this.originalTitle;
    }

    pageRender(header:HTMLElement, results:HTMLElement):void {
        this.originalTitle = document.title;

        var container = document.createElement('div');
        container.id = 'basil-summary';
        header.appendChild(container);

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

class DomFixturePlugin extends BaseTestPlugin implements TestPlugin {
    setup(test:Test, go:TestFunction) {
        var domElement : HTMLDivElement = null;

        Object.defineProperty(test.thisValue, 'dom', {
            get: function () {
                if (domElement != null)
                    return domElement;

                domElement = document.createElement('div');
                domElement.setAttribute('id', 'basil-temporary-dom-element');
                domElement.classList.add('basil-temporary-dom-element');

                document.body.appendChild(domElement);

                return domElement;
            }
        });

        go();

        if (domElement)
            document.body.removeChild(domElement);
    }
}

class ErrorTextPlugin extends BaseTestPlugin implements BrowserPlugin {
    pageRender(header:HTMLElement, results:HTMLElement):void {
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

class ExpandCollapsePlugin extends BaseTestPlugin implements BrowserPlugin {
    prefix : string = 'basil-collapsed-';
    updateAllTests : Array<() => void> = [];

    constructor(private localStorage : Storage) {
        super();
    }

    pageRender(header:HTMLElement, results:HTMLElement):void {var container = appendElement(header, 'span', { className: 'basil-expand-collapse-all' });
        var expandAll = appendElement(container, 'label', { className: 'basil-expand-all basil-header-section basil-header-button' });
        appendElement(expandAll, 'button', { className: 'basil-icon icon-plus-sign-alt' });
        appendText(expandAll, 'Expand all');
        expandAll.addEventListener('click', () => this.setCollapseAll(results, false));

        var collapseAll = appendElement(container, 'label', { className: 'basil-collapse-all basil-header-section basil-header-button' });
        appendElement(collapseAll, 'button', { className: 'basil-icon icon-minus-sign-alt' });
        appendText(collapseAll, 'Collapse all');
        collapseAll.addEventListener('click', () => this.setCollapseAll(results, true));

        this.updateCollapseAllState(results);
    }

    private setCollapseAll(resultsElement : HTMLElement, isCollapseAll : boolean) {
        Object.keys(localStorage).forEach(function(key) {
            if (key.indexOf(this.prefix) == 0)
                delete localStorage[key];
        });

        localStorage[this.prefix + '__collapseAllTests'] = isCollapseAll.toString();
        this.updateCollapseAllState(resultsElement);
        this.updateAllTests.forEach(function(update) { update(); });
    }

    updateCollapseAllState(resultsElement : HTMLElement) {
        removeClass(resultsElement, 'is-collapsed-by-default');
        removeClass(resultsElement, 'is-expanded-by-default');
        addClass(resultsElement, this.areAllTestsCollapsed ? 'is-collapsed-by-default' : 'is-expanded-by-default');
    }

    get areAllTestsCollapsed() : boolean {
        return this.localStorage[this.prefix + '__collapseAllTests'] == true.toString();
    }
    set areAllTestsCollapsed(value : boolean) {
        this.localStorage[this.prefix + '__collapseAllTests'] = value.toString();
    }

    testRender(testElement:HTMLElement, test:Test):void {
        var expandCollapseIcon = prependElement(testElement, 'i', {
            className: 'basil-icon basil-button basil-expand-collapse-icon'
        });

        if (!test.children.length)
            return;

        var key = this.collapseKey(test);

        this.applyCollapsedState(testElement, expandCollapseIcon, test);
        expandCollapseIcon.addEventListener('click', toggleCollapsed);
        this.updateAllTests.push(() => this.applyCollapsedState(testElement, expandCollapseIcon, test));

        function toggleCollapsed () {
            if (key in localStorage)
                delete localStorage[key];
            else
                localStorage[key] = !this.areAllTestsCollapsed + '';
            this.applyCollapsedState(testElement, expandCollapseIcon, test);
        }
    }

    private collapseKey(test : Test) {
        return this.prefix + test.fullKey;
    }

    private applyCollapsedState(testElement : HTMLElement, expandCollapseIcon : HTMLElement, test : Test) {
        var key = this.collapseKey(test);
        var isCollapsed = key in localStorage
            ? localStorage[key] == 'true'
            : this.areAllTestsCollapsed;

        removeClass(expandCollapseIcon, 'icon-caret-right');
        removeClass(expandCollapseIcon, 'icon-caret-down');
        removeClass(testElement, 'is-collapsed');
        removeClass(testElement, 'is-expanded');

        if (isCollapsed) {
            addClass(expandCollapseIcon, 'icon-caret-right');
            if (!this.areAllTestsCollapsed)
                addClass(testElement, 'is-collapsed');
        } else {
            addClass(expandCollapseIcon, 'icon-caret-down');
            if (this.areAllTestsCollapsed)
                addClass(testElement, 'is-expanded');
        }
    }

    onComplete():void {
    }
}


class FavIconPlugin extends BaseTestPlugin implements BrowserPlugin {
    private failedIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHdSURBVDjLpZNraxpBFIb3a0ggISmmNISWXmOboKihxpgUNGWNSpvaS6RpKL3Ry//Mh1wgf6PElaCyzq67O09nVjdVlJbSDy8Lw77PmfecMwZg/I/GDw3DCo8HCkZl/RlgGA0e3Yfv7+DbAfLrW+SXOvLTG+SHV/gPbuMZRnsyIDL/OASziMxkkKkUQTJJsLaGn8/iHz6nd+8mQv87Ahg2H9Th/BxZqxEkEgSrq/iVCvLsDK9awtvfxb2zjD2ARID+lVVlbabTgWYTv1rFL5fBUtHbbeTJCb3EQ3ovCnRC6xAgzJtOE+ztheYIEkqbFaS3vY2zuIj77AmtYYDusPy8/zuvunJkDKXM7tYWTiyGWFjAqeQnAD6+7ueNx/FLpRGAru7mcoj5ebqzszil7DggeF/DX1nBN82rzPqrzbRayIsLhJqMPT2N83Sdy2GApwFqRN7jFPL0tF+10cDd3MTZ2AjNUkGCoyO6y9cRxfQowFUbpufr1ct4ZoHg+Dg067zduTmEbq4yi/UkYidDe+kaTcP4ObJIajksPd/eyx3c+N2rvPbMDPbUFPZSLKzcGjKPrbJaDsu+dQO3msfZzeGY2TCvKGYQhdSYeeJjUt21dIcjXQ7U7Kv599f4j/oF55W4g/2e3b8AAAAASUVORK5CYII=';
    private passedIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKfSURBVDjLpZPrS1NhHMf9O3bOdmwDCWREIYKEUHsVJBI7mg3FvCxL09290jZj2EyLMnJexkgpLbPUanNOberU5taUMnHZUULMvelCtWF0sW/n7MVMEiN64AsPD8/n83uucQDi/id/DBT4Dolypw/qsz0pTMbj/WHpiDgsdSUyUmeiPt2+V7SrIM+bSss8ySGdR4abQQv6lrui6VxsRonrGCS9VEjSQ9E7CtiqdOZ4UuTqnBHO1X7YXl6Daa4yGq7vWO1D40wVDtj4kWQbn94myPGkCDPdSesczE2sCZShwl8CzcwZ6NiUs6n2nYX99T1cnKqA2EKui6+TwphA5k4yqMayopU5mANV3lNQTBdCMVUA9VQh3GuDMHiVcLCS3J4jSLhCGmKCjBEx0xlshjXYhApfMZRP5CyYD+UkG08+xt+4wLVQZA1tzxthm2tEfD3JxARH7QkbD1ZuozaggdZbxK5kAIsf5qGaKMTY2lAU/rH5HW3PLsEwUYy+YCcERmIjJpDcpzb6l7th9KtQ69fi09ePUej9l7cx2DJbD7UrG3r3afQHOyCo+V3QQzE35pvQvnAZukk5zL5qRL59jsKbPzdheXoBZc4saFhBS6AO7V4zqCpiawuptwQG+UAa7Ct3UT0hh9p9EnXT5Vh6t4C22QaUDh6HwnECOmcO7K+6kW49DKqS2DrEZCtfuI+9GrNHg4fMHVSO5kE7nAPVkAxKBxcOzsajpS4Yh4ohUPPWKTUh3PaQEptIOr6BiJjcZXCwktaAGfrRIpwblqOV3YKdhfXOIvBLeREWpnd8ynsaSJoyESFphwTtfjN6X1jRO2+FxWtCWksqBApeiFIR9K6fiTpPiigDoadqCEag5YUFKl6Yrciw0VOlhOivv/Ff8wtn0KzlebrUYwAAAABJRU5ErkJggg==';
    private runningPassedIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIMSURBVBgZpcHNi05xGMfhz/07hzTDiKZmEmLYeM3iKTKUiFhY2EhZ2NjIBgsWYoUoSWr+B7NhY6GkJBRhYSMvJYRSFDPPi3N+9/01Z2Jvcl0mif9h+46PH92yrXXpe0f9EhCBIvBwFCIUyJ2QkDsewcDsuv3y5adTN67sHytbo61rs+b0p6E5zER/u+PXgLGyUyt1vk8yU91aiSmlXJw/uJKZOnzxPY1SChpVdgQohAcEIkJ4BJ6FZ+EKKhfLh+fh4TRKJBqWDJNQMmTCwkjJMEuYOVaIIhJlFo3ITiN5OI0EmBmWjCIZqTAsQZFgVlFw/tZuTt/cjIqaRnjQSAoxzYxGApIZKRlFYRQGKcGvXLF4cBXHxjdS5R4RTqOMcP4yM6ZJnLy+DSlTRabKmUULVrJqeCMTvTZ7x0ZYoKs0ylzXTDPDAEmYGTkqdq45hCvwcALx+cdH1i0eZbLq8qx7iPXnDswv5UGjAMQUM5Do5QpX8P7bG+rI5Kipvebnrwk2LNnKZN3h8bsH38qI4C8DjClm9HKP7JmhgaXkcFzBlx8fWDh3mOcfH/L47Qs6Tsv2HR8fH1qyaH+4Ex64OxHBz8Ej9KqKKip6uWLF4Go2jezi6YdH3H/1hGXdE7fvXD6zxyTxL9aeS+3W0u19917f/VQFOz5f0CummCT+xchZa3sUfd3wka8X9I4/fgON+TR7PCxMcAAAAABJRU5ErkJggg==';
    private runningFailedIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB90CBw0qMMQJoV8AAAIRSURBVDjLpZNPSFRRFMZ/575RLMsIJCU0UIwwN0EDVhYYQtjChYskaBH92UQrIYiI2lRSUC0E19FSiKBFELg1ixYt2khUSI4tFSxnnHnvnnNavBnbKl344HI4/M73ce8Rd+d/joxPzt48PVx8slbxVnfADDdDTXFzzA1XxdxxVdSMtuasvLj46/br5xMzheJQcbqppTV0tOxocGu5otPATKGSeaisbezY+mbmAaDg6jy61LdjwPXHP8kBbgCkUXHAzVEDwzFz1AyNnsuNVJ2ezr2oaQ6g/goSBHHHg+DiiAkhCCIBEUUSJ7FAIeb9FnNAaJACICJIEJIghESQAEmApiRhbuwCb8+O4kmWAzR3Htzq/0BkCxQkn54kQiIQAsQ0pb3/MG9OjhCrNawRoXGh7gAAd14Nj+HRsJgRY8b+vh46B49TLW8w0zuAXp3KATHLthwI4O6ICJZmDFy+iJtiquDOemmFrqFB0s0yx57d4OHUlX0Fr2dJAG9EcSemNdyU1W8/sJhhWYZmGbU/v+k+c4qsUmZpfn61YGb/ItSFCLFaRWOk7VAXphE3Y325xJ7OA5Tef+D7l88oWpTxydnZju6DE6aKqaGqmBknXtwiTWtYmhLTGu1H++k9N8LywgJfPy3w8drku7mn987j7tvSA9lVfjky6ncprNwhHGnUZbvrfF+ay5bIbtO0d8p9qVH/C58rTkV50AKSAAAAAElFTkSuQmCC';

    private lastRenderTime : number = Date.now();
    private anyHasFailed : boolean = false;

    setup(test:Test, go:TestFunction) {
        go();

        if (!this.anyHasFailed && test.isComplete && !test.hasPassed) {
            this.anyHasFailed = true;
            this.setFavIcon(this.runningFailedIcon);
        }
    }

    pageRender(header:HTMLElement, results:HTMLElement):void {
        this.setFavIcon(this.runningPassedIcon);
    }

    testRender(testElement:HTMLElement, test:Test):void {
    }

    onComplete():void {
        this.setFavIcon(this.anyHasFailed ? this.failedIcon : this.passedIcon);
    }

    private setFavIcon(base64 : string) {
        var link : HTMLLinkElement = <HTMLLinkElement>document.getElementById('favIcon');
        if (!link) {
            link = document.createElement('link');
            link.id = 'favIcon';
            link.rel = 'shortcut icon';
            link.type = 'image/x-icon';
            document.head.appendChild(link);

        }
        link.href = base64;

        this.forceRender();
    }

    private forceRender() {
        if (Date.now() - this.lastRenderTime >= 250) {
            document.body.clientWidth;
            this.lastRenderTime = Date.now();
        }
    }
}

class FilterPlugin extends BaseTestPlugin implements BrowserPlugin {
    private filterForm:HTMLFormElement;
    private filterInput:HTMLInputElement;
    private testDepth : number = 0;

    constructor(private testRunner:TestRunner, private location:Location) {
        super();
    }

    test(test:Test, go:TestFunction) {
        var testKey = test.key;

        var isPartialMatch = testKey.indexOf(this.filterParts[this.testDepth] || '') > -1;
        var isExactMatch = testKey === this.filterParts[this.testDepth];
        var testMatchesFilter = isExactMatch
            || (isPartialMatch && this.testDepth == this.filterParts.length - 1)
            || this.testDepth >= this.filterParts.length;

        if (!testMatchesFilter)
            test.skip();

        this.testDepth++;
        go();
        this.testDepth--;
    }

    pageRender(header:HTMLElement, results:HTMLElement):void {
        this.filterForm = <HTMLFormElement>appendElement(header, 'form', {
            className: 'basil-filter basil-header-section',
            action: location.href
        });

        appendText(this.filterForm, 'Filter');

        this.filterInput = <HTMLInputElement>appendElement(this.filterForm, 'input', {
            type: 'search',
            name: 'filter',
            value: this.currentFilter
        });
        this.filterInput.focus();

        this.filterForm.addEventListener('submit', () => this.testRunner.abort());
        this.filterForm.addEventListener('search', () => this.filterForm.submit());
    }

    testRender(testElement:HTMLElement, test:Test):void {
        var filterElement = appendElement(testElement, 'i', {
            className: 'basil-icon basil-button icon-filter',
            title: "Filter"
        });

        filterElement.addEventListener('click', () => {
            this.filterInput.value = test.fullKey;
            this.filterForm.submit();
        });
    }

    onComplete():void {
    }

    private _filterParts : Array<string> = null;

    private get filterParts() : Array<string> {
        if (this._filterParts != null)
            return this._filterParts;

        return this._filterParts = this.currentFilter
            .toLowerCase()
            .split('>')
            .filter(Boolean)
            .map(function(filterPart) { return filterPart.trim(); });
    }

    private get currentFilter() {
        var query = this.location.search.substring(1);

        var vars = query.split('&').filter(p => !!p);
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');

            if (decodeURIComponent(pair[0]) == '') {
                var value = pair[1].replace(/\+/g, ' ');
                return decodeURIComponent(value);
            }
        }

        return '';
    }
}

class FullTimingsPlugin extends BaseTestPlugin implements BrowserPlugin {
    private timingElement : HTMLElement;
    private timingFluid : HTMLElement;
    private timingValue : HTMLElement;
    private start : number;
    private previous : number;

    constructor(private storage : Storage, private location : Location, private getMs : () => number ) {
        super();
        this.previous = parseInt(storage['basil-previous-timing-'] + location.href);
    }

    pageRender(header:HTMLElement, results:HTMLElement):void {
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

    private timeString(ms : number) : string {
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

    set elapsed(value : number) {
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

    fluidWidth(current : number) : string {
        return (Math.floor(current*100 / this.previous)) + 'px';
    }
}

class HeaderStatePlugin extends BaseTestPlugin implements BrowserPlugin {
    private headerElement : HTMLElement;

    constructor(private testRunner : TestRunner) {
        super();
    }

    pageRender(header:HTMLElement, results:HTMLElement):void {
        this.headerElement = header;
        addClass(header, 'is-running');
    }

    testRender(testElement:HTMLElement, test:Test):void {
    }

    onComplete():void {
        removeClass(this.headerElement, 'is-running');
        if (this.testRunner.failed.length > 0)
            addClass(this.headerElement, 'is-failed');
    }
}

class HidePassedPlugin extends BaseTestPlugin implements BrowserPlugin {
    constructor(private localStorage : Storage) {
        super();
    }

    pageRender(header:HTMLElement, results:HTMLElement):void {
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

    private get shouldHidePassed()  : boolean {
        return this.localStorage['basil-hide-passed'] == true.toString;
    }

    private set shouldHidePassed(value : boolean) {
        this.localStorage['basil-hide-passed'] = value.toString;
    }

    testRender(testElement:HTMLElement, test:Test):void {
        addClass(testElement, test.hasPassed ? 'is-passed' : 'is-failed');
    }
}

class InspectPlugin extends BaseTestPlugin implements BrowserPlugin {
    testRender(testElement:HTMLElement, test:Test):void {
        if (!test.inspect)
            return;

        var inspectElement = appendElement(testElement, 'i', {
            className: 'basil-icon basil-button icon-signin',
            title: 'Inspect'
        });

        inspectElement.addEventListener('click', () => test.inspect());
    }
}

class PassedFailIconPlugin extends BaseTestPlugin implements BrowserPlugin {
    testRender(testElement:HTMLElement, test:Test):void {
        var icon = appendElement(testElement, 'i');
        icon.classList.add('basil-icon');
        icon.classList.add(test.hasPassed ? 'icon-ok' : 'icon-remove')
    }
}

class TestNamePlugin extends BaseTestPlugin implements BrowserPlugin {    
    testRender(testElement:HTMLElement, test:Test):void {
        appendText(testElement, test.name);
    }
}

class TimingsPlugin extends BaseTestPlugin implements BrowserPlugin {
    private timings: { [key: string]: number } = {}

    constructor(private getMs: () => number) {
        super();
    }

    test(test: Test, go: TestFunction) {
        var start = this.getMs();
        go();
        var timeSoFar = this.timings[test.fullKey] || 0;

        var inclusiveTime = timeSoFar + Math.floor(this.getMs() - start);

        this.timings[test.fullKey] = inclusiveTime;
    }

    testRender(testElement: HTMLElement, test: Test): void {
        var timingsElement = document.createElement('span');
        timingsElement.classList.add('basil-test-timing');
        timingsElement.textContent = this.timings[test.fullKey] + 'ms';
        testElement.appendChild(timingsElement);
        addClass(timingsElement, 'basil-test-timing');
    }
}

class ViewCodePlugin extends BaseTestPlugin implements BrowserPlugin { 
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
}

export function plugins(testRunner: TestRunner, getTime: () => number, location : Location, storage : Storage): BrowserPlugin[] {
    return [
        new DomFixturePlugin(),
        new HeaderStatePlugin(testRunner),
        new BigTitlePlugin(location),
        new FavIconPlugin(),
        new DisplayTestCountPlugin(testRunner),
        new PassedFailIconPlugin(),
        new TestNamePlugin(),
        new TimingsPlugin(getTime),
        new FilterPlugin(testRunner, location),
        new InspectPlugin(),
        new ViewCodePlugin(),
        new ErrorTextPlugin(),
        new FullTimingsPlugin(storage, location, getTime),
        new HidePassedPlugin(storage),
        new ExpandCollapsePlugin(storage)
    ];
}