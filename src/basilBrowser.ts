import { Test, TestPlugin, TestFunction, TestRunner } from "./basil"
import { BrowserRunner } from "./BrowserRunner";
import * as browser from "./plugins/browser";
var browserRunner = new TestRunner(null);

// Capture as early as possible to get around test stubs and such
var browserLocation = document.location;

var realDate = Date;
var localStorage: Storage = window.localStorage || <Storage>{};

var plugins = browser.plugins(browserRunner, () => realDate.now(), document.location, localStorage);
//browserRunner.registerBrowserPlugins(plugins);

var testQueue: { name: string, fn: TestFunction }[] = [];
var isPolling = false;

var queueTest = function(name: string, fn: TestFunction) {
    if (document.body) {
        //browserRunner.test(name, fn);
    } else {
        testQueue.push({ name: name, fn: fn });
        if (!isPolling) {
            isPolling = true;
            dequeue();
        }
    }
}

function dequeue() {
    if (document.body)
        //testQueue.forEach(t => browserRunner.test(t.name, t.fn));
    //else
        setTimeout(() => dequeue(), 10);
}

export var describe = queueTest;
export var when = queueTest;
export var then = queueTest;
export var it = queueTest;
export var test = queueTest;