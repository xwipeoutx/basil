import {TestEvents, TestRunner, TestFunction} from "./runner"

interface GlebeGlobals {
    testRunner?: TestRunner,
    events?: TestEvents
}

function getGlebeSingleton(): GlebeGlobals {

    var top: { __glebeGlobals: GlebeGlobals } = <any>global;

    if (top.__glebeGlobals)
        return top.__glebeGlobals;

    var events = new TestEvents();
    var testRunner = new TestRunner(events);

    top.__glebeGlobals = {
        events: events,
        testRunner: testRunner
    };
    return top.__glebeGlobals;
}

var glebeSingleton = getGlebeSingleton();

export var events = glebeSingleton.events;
export var testRunner = glebeSingleton.testRunner;

export function test(name: string, fn: TestFunction) {
    testRunner.runTest(name, fn);
}

export var describe = test;
export var given = test;
export var when = test;
export var then = test;
export var it = test;