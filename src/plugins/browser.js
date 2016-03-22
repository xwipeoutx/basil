"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseTestPlugin = (function () {
    function BaseTestPlugin() {
    }
    BaseTestPlugin.prototype.setup = function (test, go) {
        go();
    };
    BaseTestPlugin.prototype.test = function (test, go) {
        go();
    };
    BaseTestPlugin.prototype.pageRender = function (header, results) {
    };
    BaseTestPlugin.prototype.testRender = function (testElement, test) {
    };
    BaseTestPlugin.prototype.onComplete = function () {
    };
    return BaseTestPlugin;
}());
var BigTitlePlugin = (function (_super) {
    __extends(BigTitlePlugin, _super);
    function BigTitlePlugin(location) {
        _super.call(this);
        this.location = location;
    }
    BigTitlePlugin.prototype.pageRender = function (header, results) {
        var title = document.createElement('a');
        title.href = this.location.href.replace(location.search, '');
        title.textContent = document.title || 'Basil';
        title.id = 'basil-title';
        header.appendChild(title);
    };
    BigTitlePlugin.prototype.testRender = function (testElement, test) {
    };
    BigTitlePlugin.prototype.onComplete = function () {
    };
    return BigTitlePlugin;
}(BaseTestPlugin));
var DisplayTestCountPlugin = (function (_super) {
    __extends(DisplayTestCountPlugin, _super);
    function DisplayTestCountPlugin(testRunner) {
        _super.call(this);
        this.testRunner = testRunner;
    }
    DisplayTestCountPlugin.prototype.setup = function (test, go) {
        go();
        this.passed.textContent = this.testRunner.passed.length.toString();
        this.failed.textContent = this.testRunner.failed.toString();
        this.total.textContent = this.testRunner.leaves.toString();
        document.title = "[" + this.testRunner.passed + '/' + this.testRunner.failed + '/' + this.testRunner.leaves.length + "] " + this.originalTitle;
    };
    DisplayTestCountPlugin.prototype.pageRender = function (header, results) {
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
    };
    DisplayTestCountPlugin.prototype.testRender = function (testElement, test) {
    };
    DisplayTestCountPlugin.prototype.onComplete = function () {
    };
    return DisplayTestCountPlugin;
}(BaseTestPlugin));
var DomFixturePlugin = (function (_super) {
    __extends(DomFixturePlugin, _super);
    function DomFixturePlugin() {
        _super.apply(this, arguments);
    }
    DomFixturePlugin.prototype.setup = function (test, go) {
        var domElement = null;
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
    };
    return DomFixturePlugin;
}(BaseTestPlugin));
var ErrorTextPlugin = (function (_super) {
    __extends(ErrorTextPlugin, _super);
    function ErrorTextPlugin() {
        _super.apply(this, arguments);
    }
    ErrorTextPlugin.prototype.pageRender = function (header, results) {
    };
    ErrorTextPlugin.prototype.testRender = function (testElement, test) {
        if (test.error) {
            var errorElement = appendElement(testElement, 'pre');
            appendText(errorElement, test.error);
        }
    };
    ErrorTextPlugin.prototype.onComplete = function () {
    };
    return ErrorTextPlugin;
}(BaseTestPlugin));
var ExpandCollapsePlugin = (function (_super) {
    __extends(ExpandCollapsePlugin, _super);
    function ExpandCollapsePlugin(localStorage) {
        _super.call(this);
        this.localStorage = localStorage;
        this.prefix = 'basil-collapsed-';
        this.updateAllTests = [];
    }
    ExpandCollapsePlugin.prototype.pageRender = function (header, results) {
        var _this = this;
        var container = appendElement(header, 'span', { className: 'basil-expand-collapse-all' });
        var expandAll = appendElement(container, 'label', { className: 'basil-expand-all basil-header-section basil-header-button' });
        appendElement(expandAll, 'button', { className: 'basil-icon icon-plus-sign-alt' });
        appendText(expandAll, 'Expand all');
        expandAll.addEventListener('click', function () { return _this.setCollapseAll(results, false); });
        var collapseAll = appendElement(container, 'label', { className: 'basil-collapse-all basil-header-section basil-header-button' });
        appendElement(collapseAll, 'button', { className: 'basil-icon icon-minus-sign-alt' });
        appendText(collapseAll, 'Collapse all');
        collapseAll.addEventListener('click', function () { return _this.setCollapseAll(results, true); });
        this.updateCollapseAllState(results);
    };
    ExpandCollapsePlugin.prototype.setCollapseAll = function (resultsElement, isCollapseAll) {
        Object.keys(localStorage).forEach(function (key) {
            if (key.indexOf(this.prefix) == 0)
                delete localStorage[key];
        });
        localStorage[this.prefix + '__collapseAllTests'] = isCollapseAll.toString();
        this.updateCollapseAllState(resultsElement);
        this.updateAllTests.forEach(function (update) { update(); });
    };
    ExpandCollapsePlugin.prototype.updateCollapseAllState = function (resultsElement) {
        removeClass(resultsElement, 'is-collapsed-by-default');
        removeClass(resultsElement, 'is-expanded-by-default');
        addClass(resultsElement, this.areAllTestsCollapsed ? 'is-collapsed-by-default' : 'is-expanded-by-default');
    };
    Object.defineProperty(ExpandCollapsePlugin.prototype, "areAllTestsCollapsed", {
        get: function () {
            return this.localStorage[this.prefix + '__collapseAllTests'] == true.toString();
        },
        set: function (value) {
            this.localStorage[this.prefix + '__collapseAllTests'] = value.toString();
        },
        enumerable: true,
        configurable: true
    });
    ExpandCollapsePlugin.prototype.testRender = function (testElement, test) {
        var _this = this;
        var expandCollapseIcon = prependElement(testElement, 'i', {
            className: 'basil-icon basil-button basil-expand-collapse-icon'
        });
        if (!test.children.length)
            return;
        var key = this.collapseKey(test);
        this.applyCollapsedState(testElement, expandCollapseIcon, test);
        expandCollapseIcon.addEventListener('click', toggleCollapsed);
        this.updateAllTests.push(function () { return _this.applyCollapsedState(testElement, expandCollapseIcon, test); });
        function toggleCollapsed() {
            if (key in localStorage)
                delete localStorage[key];
            else
                localStorage[key] = !this.areAllTestsCollapsed + '';
            this.applyCollapsedState(testElement, expandCollapseIcon, test);
        }
    };
    ExpandCollapsePlugin.prototype.collapseKey = function (test) {
        return this.prefix + test.fullKey;
    };
    ExpandCollapsePlugin.prototype.applyCollapsedState = function (testElement, expandCollapseIcon, test) {
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
        }
        else {
            addClass(expandCollapseIcon, 'icon-caret-down');
            if (this.areAllTestsCollapsed)
                addClass(testElement, 'is-expanded');
        }
    };
    ExpandCollapsePlugin.prototype.onComplete = function () {
    };
    return ExpandCollapsePlugin;
}(BaseTestPlugin));
var FavIconPlugin = (function (_super) {
    __extends(FavIconPlugin, _super);
    function FavIconPlugin() {
        _super.apply(this, arguments);
        this.failedIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHdSURBVDjLpZNraxpBFIb3a0ggISmmNISWXmOboKihxpgUNGWNSpvaS6RpKL3Ry//Mh1wgf6PElaCyzq67O09nVjdVlJbSDy8Lw77PmfecMwZg/I/GDw3DCo8HCkZl/RlgGA0e3Yfv7+DbAfLrW+SXOvLTG+SHV/gPbuMZRnsyIDL/OASziMxkkKkUQTJJsLaGn8/iHz6nd+8mQv87Ahg2H9Th/BxZqxEkEgSrq/iVCvLsDK9awtvfxb2zjD2ARID+lVVlbabTgWYTv1rFL5fBUtHbbeTJCb3EQ3ovCnRC6xAgzJtOE+ztheYIEkqbFaS3vY2zuIj77AmtYYDusPy8/zuvunJkDKXM7tYWTiyGWFjAqeQnAD6+7ueNx/FLpRGAru7mcoj5ebqzszil7DggeF/DX1nBN82rzPqrzbRayIsLhJqMPT2N83Sdy2GApwFqRN7jFPL0tF+10cDd3MTZ2AjNUkGCoyO6y9cRxfQowFUbpufr1ct4ZoHg+Dg067zduTmEbq4yi/UkYidDe+kaTcP4ObJIajksPd/eyx3c+N2rvPbMDPbUFPZSLKzcGjKPrbJaDsu+dQO3msfZzeGY2TCvKGYQhdSYeeJjUt21dIcjXQ7U7Kv599f4j/oF55W4g/2e3b8AAAAASUVORK5CYII=';
        this.passedIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKfSURBVDjLpZPrS1NhHMf9O3bOdmwDCWREIYKEUHsVJBI7mg3FvCxL09290jZj2EyLMnJexkgpLbPUanNOberU5taUMnHZUULMvelCtWF0sW/n7MVMEiN64AsPD8/n83uucQDi/id/DBT4Dolypw/qsz0pTMbj/WHpiDgsdSUyUmeiPt2+V7SrIM+bSss8ySGdR4abQQv6lrui6VxsRonrGCS9VEjSQ9E7CtiqdOZ4UuTqnBHO1X7YXl6Daa4yGq7vWO1D40wVDtj4kWQbn94myPGkCDPdSesczE2sCZShwl8CzcwZ6NiUs6n2nYX99T1cnKqA2EKui6+TwphA5k4yqMayopU5mANV3lNQTBdCMVUA9VQh3GuDMHiVcLCS3J4jSLhCGmKCjBEx0xlshjXYhApfMZRP5CyYD+UkG08+xt+4wLVQZA1tzxthm2tEfD3JxARH7QkbD1ZuozaggdZbxK5kAIsf5qGaKMTY2lAU/rH5HW3PLsEwUYy+YCcERmIjJpDcpzb6l7th9KtQ69fi09ePUej9l7cx2DJbD7UrG3r3afQHOyCo+V3QQzE35pvQvnAZukk5zL5qRL59jsKbPzdheXoBZc4saFhBS6AO7V4zqCpiawuptwQG+UAa7Ct3UT0hh9p9EnXT5Vh6t4C22QaUDh6HwnECOmcO7K+6kW49DKqS2DrEZCtfuI+9GrNHg4fMHVSO5kE7nAPVkAxKBxcOzsajpS4Yh4ohUPPWKTUh3PaQEptIOr6BiJjcZXCwktaAGfrRIpwblqOV3YKdhfXOIvBLeREWpnd8ynsaSJoyESFphwTtfjN6X1jRO2+FxWtCWksqBApeiFIR9K6fiTpPiigDoadqCEag5YUFKl6Yrciw0VOlhOivv/Ff8wtn0KzlebrUYwAAAABJRU5ErkJggg==';
        this.runningPassedIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIMSURBVBgZpcHNi05xGMfhz/07hzTDiKZmEmLYeM3iKTKUiFhY2EhZ2NjIBgsWYoUoSWr+B7NhY6GkJBRhYSMvJYRSFDPPi3N+9/01Z2Jvcl0mif9h+46PH92yrXXpe0f9EhCBIvBwFCIUyJ2QkDsewcDsuv3y5adTN67sHytbo61rs+b0p6E5zER/u+PXgLGyUyt1vk8yU91aiSmlXJw/uJKZOnzxPY1SChpVdgQohAcEIkJ4BJ6FZ+EKKhfLh+fh4TRKJBqWDJNQMmTCwkjJMEuYOVaIIhJlFo3ITiN5OI0EmBmWjCIZqTAsQZFgVlFw/tZuTt/cjIqaRnjQSAoxzYxGApIZKRlFYRQGKcGvXLF4cBXHxjdS5R4RTqOMcP4yM6ZJnLy+DSlTRabKmUULVrJqeCMTvTZ7x0ZYoKs0ylzXTDPDAEmYGTkqdq45hCvwcALx+cdH1i0eZbLq8qx7iPXnDswv5UGjAMQUM5Do5QpX8P7bG+rI5Kipvebnrwk2LNnKZN3h8bsH38qI4C8DjClm9HKP7JmhgaXkcFzBlx8fWDh3mOcfH/L47Qs6Tsv2HR8fH1qyaH+4Ex64OxHBz8Ej9KqKKip6uWLF4Go2jezi6YdH3H/1hGXdE7fvXD6zxyTxL9aeS+3W0u19917f/VQFOz5f0CummCT+xchZa3sUfd3wka8X9I4/fgON+TR7PCxMcAAAAABJRU5ErkJggg==';
        this.runningFailedIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB90CBw0qMMQJoV8AAAIRSURBVDjLpZNPSFRRFMZ/575RLMsIJCU0UIwwN0EDVhYYQtjChYskaBH92UQrIYiI2lRSUC0E19FSiKBFELg1ixYt2khUSI4tFSxnnHnvnnNavBnbKl344HI4/M73ce8Rd+d/joxPzt48PVx8slbxVnfADDdDTXFzzA1XxdxxVdSMtuasvLj46/br5xMzheJQcbqppTV0tOxocGu5otPATKGSeaisbezY+mbmAaDg6jy61LdjwPXHP8kBbgCkUXHAzVEDwzFz1AyNnsuNVJ2ezr2oaQ6g/goSBHHHg+DiiAkhCCIBEUUSJ7FAIeb9FnNAaJACICJIEJIghESQAEmApiRhbuwCb8+O4kmWAzR3Htzq/0BkCxQkn54kQiIQAsQ0pb3/MG9OjhCrNawRoXGh7gAAd14Nj+HRsJgRY8b+vh46B49TLW8w0zuAXp3KATHLthwI4O6ICJZmDFy+iJtiquDOemmFrqFB0s0yx57d4OHUlX0Fr2dJAG9EcSemNdyU1W8/sJhhWYZmGbU/v+k+c4qsUmZpfn61YGb/ItSFCLFaRWOk7VAXphE3Y325xJ7OA5Tef+D7l88oWpTxydnZju6DE6aKqaGqmBknXtwiTWtYmhLTGu1H++k9N8LywgJfPy3w8drku7mn987j7tvSA9lVfjky6ncprNwhHGnUZbvrfF+ay5bIbtO0d8p9qVH/C58rTkV50AKSAAAAAElFTkSuQmCC';
        this.lastRenderTime = Date.now();
        this.anyHasFailed = false;
    }
    FavIconPlugin.prototype.setup = function (test, go) {
        go();
        if (!this.anyHasFailed && test.isComplete && !test.hasPassed) {
            this.anyHasFailed = true;
            this.setFavIcon(this.runningFailedIcon);
        }
    };
    FavIconPlugin.prototype.pageRender = function (header, results) {
        this.setFavIcon(this.runningPassedIcon);
    };
    FavIconPlugin.prototype.testRender = function (testElement, test) {
    };
    FavIconPlugin.prototype.onComplete = function () {
        this.setFavIcon(this.anyHasFailed ? this.failedIcon : this.passedIcon);
    };
    FavIconPlugin.prototype.setFavIcon = function (base64) {
        var link = document.getElementById('favIcon');
        if (!link) {
            link = document.createElement('link');
            link.id = 'favIcon';
            link.rel = 'shortcut icon';
            link.type = 'image/x-icon';
            document.head.appendChild(link);
        }
        link.href = base64;
        this.forceRender();
    };
    FavIconPlugin.prototype.forceRender = function () {
        if (Date.now() - this.lastRenderTime >= 250) {
            document.body.clientWidth;
            this.lastRenderTime = Date.now();
        }
    };
    return FavIconPlugin;
}(BaseTestPlugin));
var FilterPlugin = (function (_super) {
    __extends(FilterPlugin, _super);
    function FilterPlugin(testRunner, location) {
        _super.call(this);
        this.testRunner = testRunner;
        this.location = location;
        this.testDepth = 0;
        this._filterParts = null;
    }
    FilterPlugin.prototype.test = function (test, go) {
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
    };
    FilterPlugin.prototype.pageRender = function (header, results) {
        var _this = this;
        this.filterForm = appendElement(header, 'form', {
            className: 'basil-filter basil-header-section',
            action: location.href
        });
        appendText(this.filterForm, 'Filter');
        this.filterInput = appendElement(this.filterForm, 'input', {
            type: 'search',
            name: 'filter',
            value: this.currentFilter
        });
        this.filterInput.focus();
        this.filterForm.addEventListener('submit', function () { return _this.testRunner.abort(); });
        this.filterForm.addEventListener('search', function () { return _this.filterForm.submit(); });
    };
    FilterPlugin.prototype.testRender = function (testElement, test) {
        var _this = this;
        var filterElement = appendElement(testElement, 'i', {
            className: 'basil-icon basil-button icon-filter',
            title: "Filter"
        });
        filterElement.addEventListener('click', function () {
            _this.filterInput.value = test.fullKey;
            _this.filterForm.submit();
        });
    };
    FilterPlugin.prototype.onComplete = function () {
    };
    Object.defineProperty(FilterPlugin.prototype, "filterParts", {
        get: function () {
            if (this._filterParts != null)
                return this._filterParts;
            return this._filterParts = this.currentFilter
                .toLowerCase()
                .split('>')
                .filter(Boolean)
                .map(function (filterPart) { return filterPart.trim(); });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FilterPlugin.prototype, "currentFilter", {
        get: function () {
            var query = this.location.search.substring(1);
            var vars = query.split('&').filter(function (p) { return !!p; });
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                if (decodeURIComponent(pair[0]) == '') {
                    var value = pair[1].replace(/\+/g, ' ');
                    return decodeURIComponent(value);
                }
            }
            return '';
        },
        enumerable: true,
        configurable: true
    });
    return FilterPlugin;
}(BaseTestPlugin));
var FullTimingsPlugin = (function (_super) {
    __extends(FullTimingsPlugin, _super);
    function FullTimingsPlugin(storage, location, getMs) {
        _super.call(this);
        this.storage = storage;
        this.location = location;
        this.getMs = getMs;
        this.previous = parseInt(storage['basil-previous-timing-'] + location.href);
    }
    FullTimingsPlugin.prototype.pageRender = function (header, results) {
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
}(BaseTestPlugin));
var HeaderStatePlugin = (function (_super) {
    __extends(HeaderStatePlugin, _super);
    function HeaderStatePlugin(testRunner) {
        _super.call(this);
        this.testRunner = testRunner;
    }
    HeaderStatePlugin.prototype.pageRender = function (header, results) {
        this.headerElement = header;
        addClass(header, 'is-running');
    };
    HeaderStatePlugin.prototype.testRender = function (testElement, test) {
    };
    HeaderStatePlugin.prototype.onComplete = function () {
        removeClass(this.headerElement, 'is-running');
        if (this.testRunner.failed.length > 0)
            addClass(this.headerElement, 'is-failed');
    };
    return HeaderStatePlugin;
}(BaseTestPlugin));
var HidePassedPlugin = (function (_super) {
    __extends(HidePassedPlugin, _super);
    function HidePassedPlugin(localStorage) {
        _super.call(this);
        this.localStorage = localStorage;
    }
    HidePassedPlugin.prototype.pageRender = function (header, results) {
        var label = appendElement(header, 'label', { className: 'basil-hide-passed basil-header-section' });
        var checkbox = appendElement(label, 'input', {
            type: 'checkbox',
            checked: this.shouldHidePassed
        });
        appendText(label, 'Hide Passed');
        updateHidePassedState();
        checkbox.addEventListener('change', updateHidePassedState);
        function updateHidePassedState() {
            this.shouldHidePassed = checkbox.checked;
            if (checkbox.checked)
                addClass(results, 'is-hiding-passed');
            else
                removeClass(results, 'is-hiding-passed');
        }
    };
    Object.defineProperty(HidePassedPlugin.prototype, "shouldHidePassed", {
        get: function () {
            return this.localStorage['basil-hide-passed'] == true.toString;
        },
        set: function (value) {
            this.localStorage['basil-hide-passed'] = value.toString;
        },
        enumerable: true,
        configurable: true
    });
    HidePassedPlugin.prototype.testRender = function (testElement, test) {
        addClass(testElement, test.hasPassed ? 'is-passed' : 'is-failed');
    };
    return HidePassedPlugin;
}(BaseTestPlugin));
var InspectPlugin = (function (_super) {
    __extends(InspectPlugin, _super);
    function InspectPlugin() {
        _super.apply(this, arguments);
    }
    InspectPlugin.prototype.testRender = function (testElement, test) {
        if (!test.inspect)
            return;
        var inspectElement = appendElement(testElement, 'i', {
            className: 'basil-icon basil-button icon-signin',
            title: 'Inspect'
        });
        inspectElement.addEventListener('click', function () { return test.inspect(); });
    };
    return InspectPlugin;
}(BaseTestPlugin));
var PassedFailIconPlugin = (function (_super) {
    __extends(PassedFailIconPlugin, _super);
    function PassedFailIconPlugin() {
        _super.apply(this, arguments);
    }
    PassedFailIconPlugin.prototype.testRender = function (testElement, test) {
        var icon = appendElement(testElement, 'i');
        icon.classList.add('basil-icon');
        icon.classList.add(test.hasPassed ? 'icon-ok' : 'icon-remove');
    };
    return PassedFailIconPlugin;
}(BaseTestPlugin));
var TestNamePlugin = (function (_super) {
    __extends(TestNamePlugin, _super);
    function TestNamePlugin() {
        _super.apply(this, arguments);
    }
    TestNamePlugin.prototype.testRender = function (testElement, test) {
        appendText(testElement, test.name);
    };
    return TestNamePlugin;
}(BaseTestPlugin));
var TimingsPlugin = (function (_super) {
    __extends(TimingsPlugin, _super);
    function TimingsPlugin(getMs) {
        _super.call(this);
        this.getMs = getMs;
        this.timings = {};
    }
    TimingsPlugin.prototype.test = function (test, go) {
        var start = this.getMs();
        go();
        var timeSoFar = this.timings[test.fullKey] || 0;
        var inclusiveTime = timeSoFar + Math.floor(this.getMs() - start);
        this.timings[test.fullKey] = inclusiveTime;
    };
    TimingsPlugin.prototype.testRender = function (testElement, test) {
        var timingsElement = document.createElement('span');
        timingsElement.classList.add('basil-test-timing');
        timingsElement.textContent = this.timings[test.fullKey] + 'ms';
        testElement.appendChild(timingsElement);
        addClass(timingsElement, 'basil-test-timing');
    };
    return TimingsPlugin;
}(BaseTestPlugin));
var ViewCodePlugin = (function (_super) {
    __extends(ViewCodePlugin, _super);
    function ViewCodePlugin() {
        _super.apply(this, arguments);
    }
    ViewCodePlugin.prototype.testRender = function (testElement, test) {
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
        codeIcon.addEventListener('click', function () {
            isVisible = !isVisible;
            code.className = isVisible
                ? 'basil-code is-basil-code-visible'
                : 'basil-code';
        });
    };
    return ViewCodePlugin;
}(BaseTestPlugin));
function plugins(testRunner, getTime, location, storage) {
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
exports.plugins = plugins;
