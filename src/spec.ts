import { TestEvents, TestRunner } from "./runner"
import { glebeSingleton } from "./singleton"

export var events = glebeSingleton.events;
export var testRunner = glebeSingleton.testRunner;

export function test(name: string, fn: Function) {
    testRunner.runTest(name, fn);
}

export var describe = test;
export var given = test;
export var when = test;
export var then = test;
export var it = test;