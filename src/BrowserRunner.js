"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// <reference path="../typings/browser.d.ts" />
var basil_1 = require("./basil");
var BrowserRunner = (function (_super) {
    __extends(BrowserRunner, _super);
    function BrowserRunner() {
        _super.apply(this, arguments);
        this._browserPlugins = [];
        this._completedTimeout = null;
        this.isPageRendered = false;
    }
    // public test(name: string, fn: TestFunction): Test {
    //     if (!this.isPageRendered)
    //         this.renderPage();
    //     var test = super.test(name, fn);
    //     clearTimeout(this._completedTimeout);
    //     this._completedTimeout = setTimeout(() => this.complete(), 10);
    //     if (test.isComplete)
    //         this.appendResults(this._resultsElement, [test]);
    //     return test;
    // }
    BrowserRunner.prototype.renderPage = function () {
        var header = appendElement(document.body, 'div', {
            id: 'basil-header'
        });
        var results = this._resultsElement = appendElement(document.body, 'div', {
            id: 'basil-results'
        });
        this._browserPlugins.forEach(function (plugin) { return plugin.pageRender(header, results); });
        this.isPageRendered = true;
    };
    BrowserRunner.prototype.runTest = function (name, fn) {
        var _this = this;
        var test = _super.prototype.runTest.call(this, name, fn);
        clearTimeout(this._completedTimeout);
        this._completedTimeout = setTimeout(function () { return _this.complete(); }, 10); // <number><any> because of stupid node types
        if (test.isComplete)
            this.appendResults(this._resultsElement, [test]);
        return test;
    };
    BrowserRunner.prototype.appendResults = function (el, tests) {
        var _this = this;
        tests = tests.filter(function (t) { return !t.wasSkipped; });
        if (!tests.length)
            return;
        var ul = document.createElement('ul');
        ul.className = 'basil-test-group';
        tests.forEach(function (test, i) {
            var li = _this.createTestElement(test);
            _this.appendResults(li, test.children);
            ul.appendChild(li);
        }, this);
        el.appendChild(ul);
    };
    BrowserRunner.prototype.createTestElement = function (test) {
        var li = document.createElement('li');
        li.className = 'basil-test';
        this._browserPlugins.forEach(function (plugin) { return plugin.testRender(li, test); });
        return li;
    };
    BrowserRunner.prototype.complete = function () {
        this._browserPlugins.forEach(function (plugin) { return plugin.onComplete(); });
    };
    BrowserRunner.prototype.registerBrowserPlugins = function (plugins) {
        for (var i = 0; i < plugins.length; i++) {
            this._browserPlugins.push(plugins[i]);
            _super.prototype.registerPlugin.call(this, plugins[i]);
        }
    };
    return BrowserRunner;
}(basil_1.TestRunner));
exports.BrowserRunner = BrowserRunner;
