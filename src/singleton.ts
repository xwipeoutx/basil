import {TestEvents, TestRunner} from "./runner"

export interface Globals {
    testRunner?: TestRunner,
    events?: TestEvents
}

function getInstance(): Globals {

    var top: { __glebeGlobals: Globals } = <any>global;

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

export var glebeSingleton = getInstance();