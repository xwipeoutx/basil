///<reference path="../dom-utils.ts"/>

class ExpandCollapsePlugin implements BrowserPlugin {
    prefix : string = 'basil-collapsed-';
    updateAllTests : Array<() => void> = [];

    constructor(private localStorage : WindowLocalStorage) {
    }

    setup(test:Test, go:TestFunction) {
    }

    test(test:Test, go:TestFunction) {
    }

    pageRender(browserRunner:BrowserRunner, header:HTMLElement, results:HTMLElement):void {var container = appendElement(header, 'span', { className: 'basil-expand-collapse-all' });
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
    set areAllTestsCollapsed(value : boolean) : void {
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