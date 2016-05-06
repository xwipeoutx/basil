import { TestEvents, TestRunner, TestFunction } from "./runner";
export declare var events: TestEvents;
export declare var testRunner: TestRunner;
export declare function test(name: string, fn: TestFunction): void;
export declare var describe: typeof test;
export declare var given: typeof test;
export declare var when: typeof test;
export declare var then: typeof test;
export declare var it: typeof test;
