(function(global) {
    var oldDescribe = global.describe;
    global.describe = describe;
    var localStorage = global.localStorage || {};
    var isSetup = false;
    var destinationElement;

    function describe (name, fn) {
        if (!document.body) {
            setTimeout(function() { describe(name, fn);}, 100);
            return;
        }

        if (!isSetup) {
            isSetup = true;
            destinationElement = setup();
        }

        var filter = param('filter');
        if (filter && name.indexOf(filter) == -1)
            return;

        var context = oldDescribe(name, fn);
        appendResultElements(destinationElement, [context]);
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

    function setup() {
        var destinationElement = getOrCreateDestinationElement();
        appendFilterForm(destinationElement);
        appendHidePassed(destinationElement);
        return destinationElement;

    }

    function appendFilterForm(el) {
        var form = document.createElement('form');
        form.setAttribute('method', 'get');
        form.setAttribute('action', document.location.href);
        form.style.display = 'inline-block';

        var filterTextbox = document.createElement('input');
        filterTextbox.setAttribute('type', 'text');
        filterTextbox.setAttribute('id', 'basil-filter-textbox');
        filterTextbox.setAttribute('name', 'filter');
        filterTextbox.setAttribute('value', param('filter'));

        form.appendChild(filterTextbox);
        el.appendChild(form);

        filterTextbox.focus();
    }

    function appendHidePassed(el) {
        var checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.setAttribute('id', 'basil-hide-passed-checkbox');

        var label = document.createElement('label');
        label.setAttribute('for', 'basil-hide-passed-checkbox');
        label.innerHTML += "Hide Passed";

        checkbox.addEventListener('change', function() {
            if (checkbox.checked)
                el.setAttribute('class', 'basil-hide-passed');
            else
                el.removeAttribute('class');
        });

        el.appendChild(checkbox);
        el.appendChild(label);
    }

    function appendResultElements (el, contexts) {
        if (!contexts.length)
            return;

        var ul = document.createElement('ul');
        contexts.forEach(function(context, i) {
            var li = createLi(context);
            appendResultElements(li, context.children);
            ul.appendChild(li);
        });

        el.appendChild(ul);
    }

    function createLi (context) {
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
        li.addEventListener('click', function(event) {
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

    function addInspectionLink (li, context) {
        var a = document.createElement('a');
        a.innerHTML = " inspect";
        a.setAttribute('class', 'basil-inspect');
        a.setAttribute('href', '#');

        var inspect = context.failingFunction.bind(context);
        addInspectListener(a, inspect);

        li.appendChild(a);
    }

    function addInspectListener (a, stepInHere) {
        a.addEventListener('click', function(event) {
            event.preventDefault();
            debugger;
            stepInHere();
        });
    }

    function getCssClass (context) {
        var cssClass = context.passed === true ? 'pass'
            : context.passed === false ? 'fail'
            : 'not-run';

        cssClass += context.children.length ? ' parent' : ' leaf';

        if (isCollapsed(context))
            cssClass += ' collapsed';
        return cssClass;
    }

    function getCaption (context) {
        var errorString = context.error ? ('(' + context.error.toString() + ')') : '';
        return context.name + " " + errorString;
    }

    function getOrCreateDestinationElement () {
        var destinationElement = document.getElementById("basil-test-output");
        if (!destinationElement) {
            destinationElement = document.createElement('div');
            destinationElement.setAttribute('id', 'basil-test-output');
            document.body.appendChild(destinationElement);
        }
        return destinationElement;
    }
})(this);