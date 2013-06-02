(function (global) {
    "use strict";

    function extend(constructor, subPrototype) {
        var prototype = Object.create(constructor.prototype);
        Object.keys(subPrototype).forEach(function (key) {
            prototype[key] = subPrototype[key];
        });

        return prototype;
    }

    function BrowserRunner() {
        Basil.TestRunner.call(this);
        this.registerPlugin({ setup: this._onRootTestRun.bind(this) });
    }

    BrowserRunner.prototype = extend(Basil.TestRunner, {
        start: function () {
            this._renderPage();
            Basil.TestRunner.prototype.start.call(this);
        },

        _renderPage: function () {
            var header = appendElement(document.body, 'div', {
                id: 'basil-header'
            });

            var results = this._resultsElement = appendElement(document.body, 'div', {
                id: 'basil-results'
            });

            this.runPluginQueue('pageRender', this, [header, results]);
        },

        _onRootTestRun: function (runTest, test) {
            runTest();

            clearTimeout(this._completedTimeout);
            this._completedTimeout = setTimeout(this._complete.bind(this), 10);

            if (test.isComplete())
                this._appendResults(this._resultsElement, [test]);
        },

        _appendResults: function (el, tests) {
            tests = tests.filter(function (t) { return !t.wasSkipped(); });

            if (!tests.length)
                return;

            var ul = document.createElement('ul');
            ul.className = 'basil-test-group';
            tests.forEach(function (test, i) {
                var li = this._createTestElement(test);
                this._appendResults(li, test.children());
                ul.appendChild(li);
            }, this);

            el.appendChild(ul);
        },

        _createTestElement: function (test) {
            var li = document.createElement('li');
            li.className = 'basil-test';

            this.runPluginQueue('testRender', this, [li, test]);

            return li;
        },

        _complete: function () {
            this.runPluginQueue('onComplete');
        }
    });

    Basil.BrowserRunner = BrowserRunner;

    Basil.domFixturePlugin = function () {
        return {
            setup: function (runTest) {
                var domElement = null;

                Object.defineProperty(this, 'dom', {
                    get: function () {
                        if (domElement != null)
                            return domElement;

                        return domElement = appendElement(document.body, 'div', {
                            id: 'basil-temporary-dom-element',
                            className: 'basil-temporary-dom-element'
                        });
                    }
                });

                runTest();

                if (domElement)
                    document.body.removeChild(domElement);
            }
        };
    };

    Basil.testCountPlugin = function (testRunner) {
        return {
            setup: function (runTest) {
                runTest();

                var counts = testRunner.testCounts = {
                    passed: 0,
                    failed: 0,
                    total: 0
                };

                testRunner.tests().forEach(countLeaves);

                function countLeaves(test) {
                    var children = test.children();
                    if (children.length)
                        return children.forEach(countLeaves);

                    counts.total++;
                    if (test.isComplete()) {
                        if (test.hasPassed())
                            counts.passed++;
                        else
                            counts.failed++;
                    }
                }
            }
        };
    };

    Basil.headerStatePlugin = function (testRunner) {
        var headerElement;

        return {
            pageRender: function (header) {
                headerElement = header;
                addClass(header, 'is-running');
            },

            onComplete: function () {
                var stateClass = testRunner.testCounts.failed ? 'is-failed' : '';
                removeClass(headerElement, 'is-running');
                addClass(headerElement, stateClass);
            }
        };
    };

    Basil.bigTitlePlugin = function (location) {
        return {
            pageRender: function (header) {
                appendElement(header, 'a', {
                    id: 'basil-title',
                    href: location.href.replace(location.search, ''),
                    innerText: document.title || 'Basil'
                });
            }
        };
    };

    Basil.favIconPlugin = function () {
        var failedIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHdSURBVDjLpZNraxpBFIb3a0ggISmmNISWXmOboKihxpgUNGWNSpvaS6RpKL3Ry//Mh1wgf6PElaCyzq67O09nVjdVlJbSDy8Lw77PmfecMwZg/I/GDw3DCo8HCkZl/RlgGA0e3Yfv7+DbAfLrW+SXOvLTG+SHV/gPbuMZRnsyIDL/OASziMxkkKkUQTJJsLaGn8/iHz6nd+8mQv87Ahg2H9Th/BxZqxEkEgSrq/iVCvLsDK9awtvfxb2zjD2ARID+lVVlbabTgWYTv1rFL5fBUtHbbeTJCb3EQ3ovCnRC6xAgzJtOE+ztheYIEkqbFaS3vY2zuIj77AmtYYDusPy8/zuvunJkDKXM7tYWTiyGWFjAqeQnAD6+7ueNx/FLpRGAru7mcoj5ebqzszil7DggeF/DX1nBN82rzPqrzbRayIsLhJqMPT2N83Sdy2GApwFqRN7jFPL0tF+10cDd3MTZ2AjNUkGCoyO6y9cRxfQowFUbpufr1ct4ZoHg+Dg067zduTmEbq4yi/UkYidDe+kaTcP4ObJIajksPd/eyx3c+N2rvPbMDPbUFPZSLKzcGjKPrbJaDsu+dQO3msfZzeGY2TCvKGYQhdSYeeJjUt21dIcjXQ7U7Kv599f4j/oF55W4g/2e3b8AAAAASUVORK5CYII=';
        var passedIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAKfSURBVDjLpZPrS1NhHMf9O3bOdmwDCWREIYKEUHsVJBI7mg3FvCxL09290jZj2EyLMnJexkgpLbPUanNOberU5taUMnHZUULMvelCtWF0sW/n7MVMEiN64AsPD8/n83uucQDi/id/DBT4Dolypw/qsz0pTMbj/WHpiDgsdSUyUmeiPt2+V7SrIM+bSss8ySGdR4abQQv6lrui6VxsRonrGCS9VEjSQ9E7CtiqdOZ4UuTqnBHO1X7YXl6Daa4yGq7vWO1D40wVDtj4kWQbn94myPGkCDPdSesczE2sCZShwl8CzcwZ6NiUs6n2nYX99T1cnKqA2EKui6+TwphA5k4yqMayopU5mANV3lNQTBdCMVUA9VQh3GuDMHiVcLCS3J4jSLhCGmKCjBEx0xlshjXYhApfMZRP5CyYD+UkG08+xt+4wLVQZA1tzxthm2tEfD3JxARH7QkbD1ZuozaggdZbxK5kAIsf5qGaKMTY2lAU/rH5HW3PLsEwUYy+YCcERmIjJpDcpzb6l7th9KtQ69fi09ePUej9l7cx2DJbD7UrG3r3afQHOyCo+V3QQzE35pvQvnAZukk5zL5qRL59jsKbPzdheXoBZc4saFhBS6AO7V4zqCpiawuptwQG+UAa7Ct3UT0hh9p9EnXT5Vh6t4C22QaUDh6HwnECOmcO7K+6kW49DKqS2DrEZCtfuI+9GrNHg4fMHVSO5kE7nAPVkAxKBxcOzsajpS4Yh4ohUPPWKTUh3PaQEptIOr6BiJjcZXCwktaAGfrRIpwblqOV3YKdhfXOIvBLeREWpnd8ynsaSJoyESFphwTtfjN6X1jRO2+FxWtCWksqBApeiFIR9K6fiTpPiigDoadqCEag5YUFKl6Yrciw0VOlhOivv/Ff8wtn0KzlebrUYwAAAABJRU5ErkJggg==';
        var runningPassedIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAIMSURBVBgZpcHNi05xGMfhz/07hzTDiKZmEmLYeM3iKTKUiFhY2EhZ2NjIBgsWYoUoSWr+B7NhY6GkJBRhYSMvJYRSFDPPi3N+9/01Z2Jvcl0mif9h+46PH92yrXXpe0f9EhCBIvBwFCIUyJ2QkDsewcDsuv3y5adTN67sHytbo61rs+b0p6E5zER/u+PXgLGyUyt1vk8yU91aiSmlXJw/uJKZOnzxPY1SChpVdgQohAcEIkJ4BJ6FZ+EKKhfLh+fh4TRKJBqWDJNQMmTCwkjJMEuYOVaIIhJlFo3ITiN5OI0EmBmWjCIZqTAsQZFgVlFw/tZuTt/cjIqaRnjQSAoxzYxGApIZKRlFYRQGKcGvXLF4cBXHxjdS5R4RTqOMcP4yM6ZJnLy+DSlTRabKmUULVrJqeCMTvTZ7x0ZYoKs0ylzXTDPDAEmYGTkqdq45hCvwcALx+cdH1i0eZbLq8qx7iPXnDswv5UGjAMQUM5Do5QpX8P7bG+rI5Kipvebnrwk2LNnKZN3h8bsH38qI4C8DjClm9HKP7JmhgaXkcFzBlx8fWDh3mOcfH/L47Qs6Tsv2HR8fH1qyaH+4Ex64OxHBz8Ej9KqKKip6uWLF4Go2jezi6YdH3H/1hGXdE7fvXD6zxyTxL9aeS+3W0u19917f/VQFOz5f0CummCT+xchZa3sUfd3wka8X9I4/fgON+TR7PCxMcAAAAABJRU5ErkJggg==';
        var runningFailedIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB90CBw0qMMQJoV8AAAIRSURBVDjLpZNPSFRRFMZ/575RLMsIJCU0UIwwN0EDVhYYQtjChYskaBH92UQrIYiI2lRSUC0E19FSiKBFELg1ixYt2khUSI4tFSxnnHnvnnNavBnbKl344HI4/M73ce8Rd+d/joxPzt48PVx8slbxVnfADDdDTXFzzA1XxdxxVdSMtuasvLj46/br5xMzheJQcbqppTV0tOxocGu5otPATKGSeaisbezY+mbmAaDg6jy61LdjwPXHP8kBbgCkUXHAzVEDwzFz1AyNnsuNVJ2ezr2oaQ6g/goSBHHHg+DiiAkhCCIBEUUSJ7FAIeb9FnNAaJACICJIEJIghESQAEmApiRhbuwCb8+O4kmWAzR3Htzq/0BkCxQkn54kQiIQAsQ0pb3/MG9OjhCrNawRoXGh7gAAd14Nj+HRsJgRY8b+vh46B49TLW8w0zuAXp3KATHLthwI4O6ICJZmDFy+iJtiquDOemmFrqFB0s0yx57d4OHUlX0Fr2dJAG9EcSemNdyU1W8/sJhhWYZmGbU/v+k+c4qsUmZpfn61YGb/ItSFCLFaRWOk7VAXphE3Y325xJ7OA5Tef+D7l88oWpTxydnZju6DE6aKqaGqmBknXtwiTWtYmhLTGu1H++k9N8LywgJfPy3w8drku7mn987j7tvSA9lVfjky6ncprNwhHGnUZbvrfF+ay5bIbtO0d8p9qVH/C58rTkV50AKSAAAAAElFTkSuQmCC';

        var hasFailed = false;
        var lastRenderTime = 0;

        return {
            pageRender: function () {
                setFavIconElement(runningPassedIcon);
            },

            setup: function (runTest, test) {
                runTest();

                if (!hasFailed && test.isComplete() && !test.hasPassed()) {
                    hasFailed = true;
                    setFavIconElement(runningFailedIcon);
                }
            },

            onComplete: function () {
                if (hasFailed)
                    setFavIconElement(failedIcon);
                else
                    setFavIconElement(passedIcon);
            }
        };

        function setFavIconElement(url) {
            var favIcon = document.getElementById('favIcon');
            if (!favIcon) {
                favIcon = appendElement(document.head, 'link', {
                    id: 'favIcon',
                    rel: 'shortcut icon',
                    type: 'image/x-icon'
                });
            }
            favIcon.href = url;

            forceRender();
        }

        function forceRender() {
            if (Date.now() - lastRenderTime >= 250) {
                document.body.clientWidth;
                lastRenderTime = Date.now();
            }
        }
    };

    Basil.displayTestCountPlugin = function (browserRunner) {
        var originalTitle = document.title;
        var passed, failed, total;

        return {
            pageRender: function (header) {
                var container = appendElement(header, 'div', { id: 'basil-summary' });
                passed = appendElement(container, 'span', { className: 'basil-passes' });
                appendText(container, '/');
                failed = appendElement(container, 'span', { className: 'basil-fails' });
                appendText(container, '/');
                total = appendElement(container, 'span', { className: 'basil-total' });
            },

            setup: function (runTest) {
                runTest();

                passed.innerText = browserRunner.testCounts.passed;
                failed.innerText = browserRunner.testCounts.failed;
                total.innerText = browserRunner.testCounts.total;

                document.title = "[" + browserRunner.testCounts.passed + '/' + browserRunner.testCounts.failed + '/' + browserRunner.testCounts.total + "] " + originalTitle;
            }
        };
    };

    Basil.expandCollapsePlugin = function (localStorage) {
        localStorage = localStorage || {};
        var collapseKeyPrefix = 'basil-collapsed-';
        var updateAllTests = [];

        return {
            pageRender: function (header, results) {
                var container = appendElement(header, 'span', { className: 'basil-expand-collapse-all' });

                var expandAll = appendElement(container, 'label', { className: 'basil-expand-all basil-header-section basil-header-button' });
                appendElement(expandAll, 'button', { className: 'basil-icon icon-plus-sign-alt' });
                appendText(expandAll, 'Expand all');
                expandAll.addEventListener('click', function () { setCollapseAllState(false); });

                var collapseAll = appendElement(container, 'label', { className: 'basil-collapse-all basil-header-section basil-header-button' });
                appendElement(collapseAll, 'button', { className: 'basil-icon icon-minus-sign-alt' });
                appendText(collapseAll, 'Collapse all');
                collapseAll.addEventListener('click', function () { setCollapseAllState(true); });

                applyCollapseAllState();

                function setCollapseAllState(collapseAll) {
                    localStorage.collapseAllTests = collapseAll + '';
                    applyCollapseAllState();

                    Object.keys(localStorage).forEach(function (key) {
                        if (key.indexOf(collapseKeyPrefix) == 0)
                            delete localStorage[key];
                    });
                    updateAllTests.forEach(function (update) { update(); });
                }

                function applyCollapseAllState() {
                    removeClass(results, '(is-collapsed-by-default|is-expanded-by-default)');
                    addClass(results, areAllTestsCollapsed() ? 'is-collapsed-by-default' : 'is-expanded-by-default');
                }
            },

            testRender: function (testElement, test) {
                var expandCollapseIcon = prependElement(testElement, 'i', {
                    className: 'basil-icon basil-button basil-expand-collapse-icon'
                });

                if (!test.children().length)
                    return;

                var key = collapseKey(test);

                applyCollapsedState(testElement, test);
                expandCollapseIcon.addEventListener('click', toggleCollapsed);
                updateAllTests.push(applyCollapsedState.bind(this, testElement, test));

                function toggleCollapsed() {
                    if (key in localStorage)
                        delete localStorage[key];
                    else
                        localStorage[key] = !areAllTestsCollapsed() + '';
                    applyCollapsedState(testElement, test);
                }
            }
        };

        function applyCollapsedState(testElement, test) {
            var key = collapseKey(test);
            var isCollapsed = key in localStorage
                ? localStorage[key] == 'true'
                : areAllTestsCollapsed();

            var expandCollapseIcon = testElement.querySelector('.basil-expand-collapse-icon');
            removeClass(expandCollapseIcon, '(icon-caret-right|icon-caret-down)');
            removeClass(testElement, '(is-collapsed|is-expanded)');

            if (isCollapsed) {
                addClass(expandCollapseIcon, 'icon-caret-right');
                if (!areAllTestsCollapsed())
                    addClass(testElement, 'is-collapsed');
            } else {
                addClass(expandCollapseIcon, 'icon-caret-down');
                if (areAllTestsCollapsed())
                    addClass(testElement, 'is-expanded');
            }
        }

        function collapseKey(test) {
            return collapseKeyPrefix + test.fullKey();
        }

        function areAllTestsCollapsed() {
            return localStorage.collapseAllTests == 'true';
        }
    };

    Basil.passedFailedIconPlugin = function () {
        return {
            testRender: function (testElement, test) {
                appendElement(testElement, 'i', {
                    className: 'basil-icon '
                        + (test.hasPassed() ? 'icon-ok' : 'icon-remove')
                });
            }
        };
    };

    Basil.testNamePlugin = function () {
        return {
            testRender: function (testElement, test) {
                appendText(testElement, test.name());
            }
        };
    };

    Basil.errorTextPlugin = function () {
        return {
            testRender: function (testElement, test) {
                var error = test.error();
                if (error)
                    appendText(testElement, ' (' + error + ')');
            }
        };
    };

    Basil.filterPlugin = function (browserRunner, location) {
        var filter = (param('filter') || '');
        var filterParts = filter
            .toLowerCase()
            .split('>')
            .filter(Boolean)
            .map(function (filterPart) { return filterPart.trim(); });
        var testDepth = 0;
        var filterForm, filterInput;

        return {
            pageRender: function (header) {
                filterForm = appendElement(header, 'form', {
                    className: 'basil-filter basil-header-section',
                    action: location.href
                });

                appendText(filterForm, 'Filter');

                filterInput = appendElement(filterForm, 'input', {
                    type: 'search',
                    name: 'filter',
                    value: filter
                });
                filterInput.focus();

                filterForm.addEventListener('submit', function () {
                    browserRunner.abort();
                });

                filterForm.addEventListener('search', function () {
                    filterForm.submit();
                });
            },

            testRender: function (testElement, test) {
                var filterElement = appendElement(testElement, 'i', {
                    className: 'basil-icon basil-button icon-filter'
                });
                filterElement.addEventListener('click', function () {
                    filterInput.value = test.fullKey();
                    filterForm.submit();
                });
            },

            test: function (runTest, test) {
                var testKey = test.key();

                var isPartialMatch = testKey.indexOf(filterParts[testDepth] || '') > -1;
                var isExactMatch = testKey === filterParts[testDepth];
                var testMatchesFilter = isExactMatch
                    || (isPartialMatch && testDepth == filterParts.length - 1)
                    || testDepth >= filterParts.length;

                if (!testMatchesFilter)
                    test.skip();

                testDepth++;
                runTest();
                testDepth--;
            }
        };

        function param(key) {
            var query = location.search.substring(1);
            var vars = query.split('&');
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split('=');
                if (decodeURIComponent(pair[0]) == key) {
                    var value = pair[1].replace(/\+/g, ' ');
                    return decodeURIComponent(value);
                }
            }
        }
    };

    Basil.inspectPlugin = function () {
        return {
            testRender: function (testElement, test) {
                if (!test.inspect)
                    return;

                var inspectElement = appendElement(testElement, 'i', {
                    className: 'basil-icon basil-button icon-signin'
                });
                inspectElement.addEventListener('click', function () {
                    debugger;
                    test.inspect.call(test.inspectThisValue);
                });
            }
        };
    };

    Basil.viewCodePlugin = function () {
        return {
            testRender: function (testElement, test) {
                if (!test.inspect)
                    return;

                var codeIcon = appendElement(testElement, 'i', {
                    className: 'basil-icon basil-button icon-code'
                });

                var code = appendElement(testElement, 'code', {
                    innerHTML: test.inspect.toString().split("\n").slice(1, -1).join("\n"),
                    className: 'basil-code'
                });

                var isVisible = false;
                codeIcon.addEventListener('click', function () {
                    isVisible = !isVisible;
                    code.className = isVisible
                        ? 'basil-code is-basil-code-visible'
                        : 'basil-code';
                });
            }
        };
    };

    Basil.hidePassedPlugin = function (localStorage) {
        localStorage = localStorage || {};

        return {
            pageRender: function (header, results) {
                var label = appendElement(header, 'label', { className: 'basil-hide-passed basil-header-section' });

                var checkbox = appendElement(label, 'input', {
                    type: 'checkbox',
                    checked: localStorage.isHidePassedChecked == 'true'
                });

                appendText(label, 'Hide Passed');

                updateHidePassedState();

                checkbox.addEventListener('change', updateHidePassedState);

                function updateHidePassedState() {
                    localStorage.isHidePassedChecked = checkbox.checked + '';
                    if (checkbox.checked)
                        addClass(results, 'is-hiding-passed');
                    else
                        removeClass(results, 'is-hiding-passed');
                }
            },

            testRender: function (testElement, test) {
                addClass(testElement,
                    test.hasPassed()
                        ? ' is-passed'
                        : ' is-failed');
            }
        };
    };

    Basil.notificationPlugin = function (testRunner, notifications) {
        // Icons by Visual Pharm - http://www.visualpharm.com
        var failedIcon = 'data:image/png;base64,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';
        var passedIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAALMUlEQVRogc2aa5Ac1XXHf/fe7p7Xzs6+d/YhrVZCoJJVKLIxxgkg5BiDZSJsqEROyXZCVb6lyo5SpEiIDSTOh2Aq4JQfFWMLOUUp/uAPSdkujKjYIkhIQhjQMvvelfY5+5zdefbM7Mz0dD50zz4shB5eaX2qbt2era0753/O/57zv7dH8Hto2g+0x6QQfymkvFchk8pW3SInjqW+mn4JKALlyv+KjXPzUpMvyhphi9d31e3e/cmmu+kIbGUmO8uYeZHuxHsk8rFJ64L1pfi/JM/gALHVRjtdsYrzB7d+afdn2j7HXHaRt+fOE8st4BE+tgVvI2TUVierFh8VQf53qWspBlhyox2vmEQc3lW3e/cdDZ/g9NRbdMV6MIsZUoUUUXOK8cwkDZ4w26p3BgOf9P8rUANovxcAtP/Q9vj1wFMHOw8xkBgmmp1GCkCAECCEIFfKM5ePsdl/C3qNvheoBzzaBvsOgFTihQObHkETGj2LfUjheL8mugIs20IKgUd5AKoAY8MBGD/UD2+rvnXvHQ2f4NT0WddJ6UQfAIFwS42UAikFZdsCUIDYUACeHxk12OLpA5sfYT6/wHRuBimF47hYKZCVzyEjSMHOQ5E53FK6oXtA2OLfP7Pps6Gwv4XfzL+LFBIpJVKq5WflftalRo03xPxSlNK0VSmj1oZlwPdD7746X/1X7gnvYzA5TL6cR0rpRhuEy6FKHloDLVgUmcqNEf9Z/KeACRQ2DIAQ4ujBrYfAhr7EgOu8w/e1zguq9AAhI8h7i6fJDGT+K3kyfRFIbhiAwBH/P+2qu73jltB23pg+jSYVQohLIi+EQCJprQoTNUdYTMQujjw5fgRYAFJsBIWqfhDo9Om+pw50PMJ4JspiIY5Uq6IvxJpMtPibKdkFRhKD5vSLs88Ai0AMyAH2Td/EQhdHH2jfT7URoifRi5ICTUo0JdGUQpNqea72BKk2gvTGz5PqSR1LnkoNAXNAGrcK3dQMBI9UfaGtqn3vPS330RWPUBYWSmpIN9pCuANQUtESaGY8PUJsbjYy8sz4T3AinwBKlTVvGoDqo8EaAUe/eMshFgtxJszJZe5Lscp54dAn7G3GsgtcWOwzp1+aew6HOgtAHrAr6940CgnEM/e27gu1BzbTl+xHkwqlFJqS7rwy6j21VHuCvB97h0QkdSxxKjmEE/0Mq84CcJMyUHOkep9fD3ztgU37GU4PY1oZlJJus1qbAV3qNPjqGUkOMzczE7n4zOgHUuemAhBKvvDF7YcQUjCWHUMpBZQpY+HUTLlMpUZfPflyjoH5XjN6ZPay1LlpAOp+XHN4S2jr7q2hWzg1f5qp/DSqIhGEO9vOXGvUYosy70y/RSKSOBY/lbgsdS4F8G06UfwNgj3YCCBBgV9wgf/h+8xfboEPdf5ITadfCzz9+c5HiWajzOSn0ZXmAlBrgHiUQZOvkcnkGPMz85Ghp0c+lDprAXyHx3y676W9LZ9iW+hW0sUMqWKS3kT3Q4P+3m/xLM/xBP8GLF0LEKnkt+9q+cNQ0BPk7dl3XOfdjVsBIBRSSlp9LZTtEhfmB83okakrUmf5O/gO+3y676W/3nmYP2rex3RmgflsEsoe7mq4j0e3fLm6rqnhmzzPy0AQR4df0RqP1u+r9dcd2Nf+KQbSgxTsJXRNw9A0dKWjKw1D6RiaRoO3nmojSGT2PPFI8tjiyStTp2KK/fznX2z/q44mX5jjEyeILyUxS1nSxQzpYopaby3bq3cQLY3vzN2dvY3XOI57I3BZ51+urxFCvPrntx6qUUrRlexCUxp6ZWjOrCkNr+alxRdmNHGRoZHhSO/XBp4DZoB5oHClQEkU9+6qu53zsR4KZcevSjcs2iVGU+PkrQIPtf8prU2bvyC+y2nxoOgA9MsuasvDe5o+1tEZ2kYk1e04r6113nCz0eILkyuaRKJd5uSPoldNnYo5e0BAspBy/+SK2GVRJeiN91OlB9hV9zGUVDtmHpp8pVws/4n1K2vUzcayNf+4cY9P9z31YMfnGDVHSVspN9pOk9Kl86ykotaoIWgEeG30TTI92WMLJ+NXTZ2VDDi6FRvbAVzR4cKp1GOZceZzMSbMSWayc9xefwc7w7tv8/yZ8brvb733Ah5Wzh1IJV94oOOzGEpn2BxGkxq6Usucr2TAr3tp8NbTN9fHwkws0v+NoauqOpcCKBOJxM/TWb0ZKdSyDl+ylhhKXCBXck5KUgjihThT2Rm2Vm9nd/jjrcYu/b+rvhrYWwHR8nLzY52hzr0fbbqDrlQXtigvO796GJpGs7cJcylDdzRijl8HdSqmuIfkHLOPfrzxLoQQpAsZFgtxJjNTIEApp1Yr5ZS9ol2kaBdpD26iKRD2xEOxzxt79GnvDs+0sVn/+cHbDnmLFBkyB5c36orzDphao5YaI8TrF15n+tTs9yaOTb0BTLvRt67WeQfArxhM353a0Z/r3bk9uAMhBH2LAyBwD9VqZbg63aJEvpynraqN1mCbZ96YOaBa5P77Ov64/SP1uziXOAeStZHXnOHTvTR5m+iZ6WVwYOhs99/1f49rqDqXAgCb13g1f2e2eoKxOwOqhjpPDaliGiGEG/0VIBX1iIClcp5GfxNtVe1ITTQ+2LGfsdwYsWLskpJpuHPY20y2kOXk4Cmz9xsDjxfjxUkXQJZroM5aAFDi17y59JFcMhGIfbrN10Gdt5Z0KY0Uwo2+dCSwdE9NUoEE0zJp9DfSWbMNKQV96V50pdaUTkNzGletp4YaPcSvh04wfnzy2dlfzr8DTOEc0K+JOqsB4IIocJLzpduXEgu+2fsbfWEafY2ki2mkFGuiv6zdXWD5co6gUcVkfhIkl9Z9TSOg+Wj2NhOZ7magf+Bs95P9L+LwPsZ1UOe3AVRAlHiD8/YflJOLvtn7w742wv4weSuHLexVGZDu5lwBkbVMl/dqecNq2gqQsDdMZinDGwMnzZ6vDzxeiBejwCzu4fx6Afz2iawMZEv/XPq+NVZ6oif5G0r2EltDnfg137Jmd0SY81y5PVtRlytzhWq1Ri1e5eX0yBnmT8Sez1wwozib1uQ6VO5q+yBhZgOl0v9Z57WPqmTcO39/g7eZZn8zeSvnltaV24NKZ9UqkZdrS6Zf89HkaaJ7upuB/sGz7/9D37pQ58MALIMonCie13dpE0lv7L4Gf7PR7G8mV86BSyfNlQi60tDkpQ1LV4qwN4xZMDk5eMqMfL3v8cLi+lCnYh92qC8D2eQ3Uy9n38oe7I29m8lbWbYEN+PTvAi3O0shl2klVw0lJbV6LV7l4ezIWeZOxJ7PDK8fdSp2JW1vA1b+7aUJbZM6l66LP+wz/J72wCaWynmEsB1hplbkcaXz+nSHOr1uw+r6+551pc7VAlgGkXsrP2ls1s+ZdcmHA0aVp62q3XlrQmnVHnBnTdHiaSFbMDlz4YzZ9Y+9jxcWC+tKnWsBUDHLPJud9G7xnsvWpx6u8lR5WqvaKAvndmE1iDqjDq/ycnb0DGOvTjwbfWXmd25Y6wEAwEqfyUz6tnjPmXWZh/16wNMaaMMWNmVhoSuFX3caVv9sL6PDY2fffSJyQ6hzvQAArNTp9KR/i++cWZW8M+AP1LcGWpfFXqO3kVQuxfsTXeZ7T0ZuGHUqdr0vuq3Em8lJK2kdL21f+rTURENzIEytp5Z8Mcf7U+8xcTz6bPSV6RtGnYr9Lm/qrezFXLKcLf+y3FbsiGYn2kYTF43x2dG52dNzL3Z/q//nOCpzgRtAnYqtx28ldCAENLBy7bIExHFqfo51qvkfZOv1Yw8N51hpuGtaOCAK3EDnAYRtr/u+uqn2/+06dvy3qQOnAAAAAElFTkSuQmCC';
        var title = document.title;
        var PERMISSION_ALLOWED = 0;

        return {
            _failedIcon: failedIcon,    // for testing
            _passedIcon: passedIcon,

            pageRender: function (header, results) {
                if (!notifications || notifications.checkPermission() == PERMISSION_ALLOWED)
                    return;

                var label = appendElement(header, 'span', { className: 'basil-header-section basil-header-button' });
                appendElement(label, 'button', { className: 'basil-icon icon-comment' });
                appendText(label, 'Enable notifications');

                label.addEventListener('click', function () {
                    notifications.requestPermission();
                }, false);
            },

            onComplete: function () {
                var testCounts = testRunner.testCounts;
                var icon = testCounts.failed ? failedIcon : passedIcon;
                var message, error;
                if (testCounts.failed) {
                    error = findError(testRunner.tests()) + '';
                    message = testCounts.failed + ' of ' + testCounts.total + ' failed.\n' + error;
                } else {
                    message = 'All ' + testCounts.total + ' tests passed!';
                }
                var notification = notifications.createNotification(icon, title, message);
                notification.show();

                window.addEventListener('beforeunload', function () {
                    notification.cancel();
                });

                setTimeout(function () {
                    notification.cancel();
                }, error ? error.length * 200 / 6 + 1000 : 1000);
            }
        };

        function findError(tests) {
            for (var i = 0; i < tests.length; i++) {
                var error = tests[i].error()
                    || findError(tests[i].children());
                if (error)
                    return error;
            }
        }
    }

    function appendElement(el, tagName, properties) {
        return el.appendChild(createElement(tagName, properties));
    }

    function prependElement(el, tagName, properties) {
        if (!el.childNodes.length)
            return appendElement(el, tagName, properties);

        return el.insertBefore(createElement(tagName, properties), el.childNodes[0]);
    }

    function createElement(tagName, properties) {
        var newElement = document.createElement(tagName);
        if (properties)
            Object.keys(properties).forEach(function (key) {
                newElement[key] = properties[key];
            });
        return newElement;
    }

    function appendText(el, text) {
        el.appendChild(document.createTextNode(text));
    }

    function addClass(el, className) {
        if (!new RegExp('\\b' + className + '\\b').test(el.className))
            el.className += ' ' + className;
    }

    function removeClass(el, className) {
        el.className = el.className.replace(new RegExp('\\b' + className + '\\b'), '');
    }
})(this);

basil = new Basil.BrowserRunner();
basil.registerPlugin(
    Basil.domFixturePlugin(),
    Basil.testCountPlugin(basil),
    Basil.headerStatePlugin(basil),
    Basil.bigTitlePlugin(location),
    Basil.favIconPlugin(),
    Basil.displayTestCountPlugin(basil),
    Basil.passedFailedIconPlugin(),
    Basil.testNamePlugin(),
    Basil.errorTextPlugin(),
    Basil.filterPlugin(basil, location),
    Basil.inspectPlugin(),
    Basil.viewCodePlugin(),
    Basil.hidePassedPlugin(localStorage),
    Basil.expandCollapsePlugin(localStorage),
    Basil.notificationPlugin(basil, window.notifications || window.webkitNotifications)
);

test = describe = when = then = it = basil.test;

(function waitForBody() {
    if (document.body)
        basil.start();
    else
        setTimeout(waitForBody, 10);
})();
