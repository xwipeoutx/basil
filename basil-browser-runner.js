(function(global) {
    var oldDescribe = global.describe;
    global.describe = describe;

    function describe (name, fn) {
        if (!document.body) {
            setTimeout(function() { describe(name, fn);}, 100);
            return;
        }

        var context = oldDescribe(name, fn);
        logResults(context);
    }

    function logResults (context) {
        console.log(context);

        var destinationElement = getOrCreateDestinationElement();

        appendDomElements(destinationElement, [context]);

        function appendDomElements (el, contexts) {
            if (!contexts.length)
                return;

            var ul = document.createElement('ul');
            contexts.forEach(function(context, i) {
                var li = createLi(context);
                appendDomElements(li, context.children);
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

            if (context.failingFunction)
                addInspectionLink(li, context);

            return li;
        }

        function addInspectionLink(li, context) {
            var a = document.createElement('a');
            a.innerHTML = " inspect";
            a.setAttribute('class', 'basil-inspect');
            a.setAttribute('href', '#');

            var inspect = context.failingFunction.bind(context);
            addInspectListener(a, inspect);

            li.appendChild(a);
        }

        function addInspectListener(a, inspect) {
            a.addEventListener('click', function() {
                debugger;
                inspect();
                return false;
            });
        }

        function getCssClass (context) {
            return context.passed === true ? 'pass'
                : context.passed === false ? 'fail'
                : 'not-run';
        }

        function getCaption (context) {
            var errorString = context.error ? ('(' + context.error.toString() + ')') : '';
            return context.name + " " + errorString;
        }
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