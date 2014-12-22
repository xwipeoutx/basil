/**
 * Created by Leighs on 22/12/2014.
 */

var browserRunner = new BrowserRunner();

// Capture as early as possible to get around test stubs and such
var location = document.location;
var RealDate = Date;
var localStorage:WindowLocalStorage = window.localStorage || {};

browserRunner.registerPlugin(
    new DomFixturePlugin(),
    new TestCountPlugin(browserRunner),
    new HeaderStatePlugin(browserRunner),
    new BigTitlePlugin(location),
    new FavIconPlugin(),
    new DisplayTestCountPlugin(browserRunner),
    new PassedFailIconPlugin(),
    new TestNamePlugin(),
    new TimingsPlugin(() => RealDate.now()),
    new FilterPlugin(browserRunner, location),
    new InspectPlugin(),
    new ViewCodePlugin(),
    new ErrorTextPlugin(),
    new FullTimingsPlugin(localStorage, location, () => RealDate.now()),
    new HidePassedPlugin(localStorage),
    new ExpandCollapsePlugin(localStorage)
);

var test = (name, fn) => browserRunner.test(name, fn);

(function waitForBody() {
    if (document.body)
        browserRunner.start();
    else
        // Try this: document.addEventListener('load', waitForBody);
        setTimeout(waitForBody, 10);
})();