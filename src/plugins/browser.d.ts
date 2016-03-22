import { TestRunner } from "../basil";
import { BrowserPlugin } from "../BrowserRunner";
export declare function plugins(testRunner: TestRunner, getTime: () => number, location: Location, storage: Storage): BrowserPlugin[];
