(function (global) {
    var oldDescribe = global.describe;
    global.describe = describe;
    var localStorage = global.localStorage || {};
    var isSetup = false;
    var destinationElement;

    function describe(name, fn) {
        if (!document.body) {
            setTimeout(function () { describe(name, fn); }, 100);
            return;
        }

        if (!isSetup) {
            isSetup = true;
            setup();
        }

        var filter = param('filter');
        if (filter && name.toLowerCase().indexOf(filter.toLowerCase()) == -1)
            return;

        var context = oldDescribe(name, fn);
        appendResults(document.getElementById('basil-results'), [context]);
    }

    function param(key) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == key) {
                return decodeURIComponent(pair[1]);
            }
        }
    }

    var baseTemplate =
        '<div class="basil-header">'
            + '<div id="basil-title"></div>'
            + '<form method="get" id="basil-settings">'
                + '<label>Filter <input type="text" id="basil-filter" name="filter"></label>'
                + '<label><input type="checkbox" id="basil-hide-passed" name="hide-passed">Hide Passed</label>'
            + '</form>'
        + '</div>'
        + '<div id="basil-results"></div>';

    function setup() {
        createBaseStructure();
        setTitle();
        setupSettingsForm();
        setupHidePassed();

        function createBaseStructure() {
            var body = document.body;
            createDom(baseTemplate)
                .forEach(body.appendChild.bind(body));
        }

        function setTitle() {
            var pageTitle = document.getElementsByTagName('title');
            var titleText = pageTitle.length ? pageTitle[0].innerText : 'Basil';
            document.getElementById('basil-title').innerText = titleText;
        }

        function setupSettingsForm() {
            document.getElementById('basil-settings').setAttribute('action', document.location.href);

            var filter = document.getElementById('basil-filter');
            filter.setAttribute('value', param('filter') || '');
            filter.focus();
        }

        function setupHidePassed() {
            var checkbox = document.getElementById('basil-hide-passed')
            var results = document.getElementById('basil-results');

            checkbox.addEventListener('change', function () {
                if (checkbox.checked)
                    results.setAttribute('class', 'is-hiding-passed');
                else
                    results.removeAttribute('class');
            });
        }
    }

    function appendResults(el, contexts) {
        if (!contexts.length)
            return;

        var ul = document.createElement('ul');
        contexts.forEach(function (context, i) {
            var li = createLi(context);
            appendResults(li, context.children);
            ul.appendChild(li);
        });

        el.appendChild(ul);
    }

    function createLi(context) {
        var cssClass = getCssClass(context);
        var caption = getCaption(context);

        var li = document.createElement('li');
        li.setAttribute('class', cssClass);
        li.context = context;
        li.innerHTML = caption;

        if (context.children.length)
            addExpandCollapse(li, context);

        if (context.failingFunction)
            addInspectionLink(li, context);

        return li;
    }

    function addExpandCollapse(li, context, cssClass) {
        li.addEventListener('click', function (event) {
            if (event.target != li)
                return;

            toggleCollapsed(context);
            li.setAttribute('class', getCssClass(context));
        });
    }

    function isCollapsed(context) {
        var key = 'basil-collapsed-' + context.fullName();
        return !!localStorage[key];
    }
    function toggleCollapsed(context) {
        var key = 'basil-collapsed-' + context.fullName();
        if (localStorage[key])
            delete localStorage[key];
        else
            localStorage[key] = true;

    }

    function addInspectionLink(li, context) {
        var a = document.createElement('a');
        a.innerHTML = " inspect";
        a.setAttribute('class', 'basil-inspect');
        a.setAttribute('href', '#');

        var inspect = context.failingFunction.bind(context.failingScope);
        addInspectListener(a, inspect);

        li.appendChild(a);
    }

    function addInspectListener(a, stepInHere) {
        a.addEventListener('click', function (event) {
            event.preventDefault();
            debugger;
            stepInHere();
        });
    }

    function getCssClass(context) {
        var cssClass = context.passed === true ? 'is-passed'
            : context.passed === false ? 'is-failed'
            : 'is-not-run';

        cssClass += context.children.length ? ' basil-parent' : ' basil-leaf';

        if (isCollapsed(context))
            cssClass += ' is-collapsed';
        return cssClass;
    }

    function getCaption(context) {
        var errorString = context.error ? ('(' + context.error.toString() + ')') : '';
        return context.name + " " + errorString;
    }

    var nursery = document.createElement('div');

    function createDom(html) {
        nursery.innerHTML = html;
        var elements = [];

        while (nursery.children.length)
            elements.push(nursery.removeChild(nursery.children[0]));

        return elements;
    }
})(this);