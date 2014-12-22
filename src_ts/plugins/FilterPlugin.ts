class FilterPlugin implements BrowserPlugin {
    private filterForm:HTMLFormElement;
    private filterInput:HTMLInputElement;
    private testDepth : Number = 0;

    constructor(private browserRunner:BrowserRunner, private location:Location) {

    }

    setup(test:Test, go:TestFunction) {

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

    pageRender(browserRunner:BrowserRunner, header:HTMLElement, results:HTMLElement):void {
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

        this.filterForm.addEventListener('submit', () => this.browserRunner.abort());
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

    private _filterParts : string = null;

    private get filterParts() {
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

        var vars = query.split('&');
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