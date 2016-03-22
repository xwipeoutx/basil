var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseTestPlugin_1 = require("./BaseTestPlugin");
var FilterPlugin = (function (_super) {
    __extends(FilterPlugin, _super);
    function FilterPlugin(browserRunner, location) {
        _super.call(this);
        this.browserRunner = browserRunner;
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
    FilterPlugin.prototype.pageRender = function (browserRunner, header, results) {
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
        this.filterForm.addEventListener('submit', function () { return _this.browserRunner.abort(); });
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
})(BaseTestPlugin_1.BaseTestPlugin);
