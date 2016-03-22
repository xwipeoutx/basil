var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BaseTestPlugin_1 = require("./BaseTestPlugin");
var HidePassedPlugin = (function (_super) {
    __extends(HidePassedPlugin, _super);
    function HidePassedPlugin(localStorage) {
        _super.call(this);
        this.localStorage = localStorage;
    }
    HidePassedPlugin.prototype.pageRender = function (browserRunner, header, results) {
        var label = appendElement(header, 'label', { className: 'basil-hide-passed basil-header-section' });
        var checkbox = appendElement(label, 'input', {
            type: 'checkbox',
            checked: this.shouldHidePassed
        });
        appendText(label, 'Hide Passed');
        updateHidePassedState();
        checkbox.addEventListener('change', updateHidePassedState);
        function updateHidePassedState() {
            this.shouldHidePassed = checkbox.checked;
            if (checkbox.checked)
                addClass(results, 'is-hiding-passed');
            else
                removeClass(results, 'is-hiding-passed');
        }
    };
    Object.defineProperty(HidePassedPlugin.prototype, "shouldHidePassed", {
        get: function () {
            return this.localStorage['basil-hide-passed'] == true.toString;
        },
        set: function (value) {
            this.localStorage['basil-hide-passed'] = value.toString;
        },
        enumerable: true,
        configurable: true
    });
    HidePassedPlugin.prototype.testRender = function (testElement, test) {
        addClass(testElement, test.hasPassed ? 'is-passed' : 'is-failed');
    };
    HidePassedPlugin.prototype.onComplete = function () {
    };
    return HidePassedPlugin;
})(BaseTestPlugin_1.BaseTestPlugin);
