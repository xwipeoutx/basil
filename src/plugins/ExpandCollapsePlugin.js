var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseTestPlugin_1 = require("./BaseTestPlugin");
var ExpandCollapsePlugin = (function (_super) {
    __extends(ExpandCollapsePlugin, _super);
    function ExpandCollapsePlugin(localStorage) {
        _super.call(this);
        this.localStorage = localStorage;
        this.prefix = 'basil-collapsed-';
        this.updateAllTests = [];
    }
    ExpandCollapsePlugin.prototype.pageRender = function (browserRunner, header, results) {
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
})(BaseTestPlugin_1.BaseTestPlugin);
