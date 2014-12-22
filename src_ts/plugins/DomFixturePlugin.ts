/// <reference path="../TestRunner.ts" />


class DomFixturePlugin implements TestPlugin {
    setup(test:Test, go:TestFunction) {
        var domElement = null;

        Object.defineProperty(this, 'dom', {
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

    test(test:Test, go:TestFunction) {
        go();
    }
}