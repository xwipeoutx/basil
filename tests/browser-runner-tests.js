describe("Browser Runner", function () {
    var browserRunner = new Basil.BrowserRunner();

    describe("DOM fixture plugin", function () {
        var sut = Basil.domFixturePlugin();
        var testContext = {};

        when("setup called", function () {
            sut.setup.call(testContext, function () {
                then("dom element added to body", function () {
                    expect(testContext.dom).to.be.an.instanceOf(HTMLElement);
                    expect(testContext.dom.parentElement).to.equal(document.body);
                });

                then("dom element is empty", function () {
                    expect(testContext.dom.children.length).to.equal(0);
                });
            });
        });

        when("after setup complete", function () {
            sut.setup.call(testContext, function () { testContext.dom; });

            then("dom element has been removed from body", function () {
                expect(testContext.dom.parentElement).to.be.null;
            });
        })
    });

    describe("Test count plugin", function () {
        var sut = Basil.testCountPlugin(browserRunner);

        when("test runner has no tests", function () {
            browserRunner.tests = function () { return []; };

            when("test tree is run", function () {
                sut.setup.call({}, function () { });

                then("test counts are 0", function () {
                    expect(browserRunner.testCounts).to.deep.equal({
                        passed: 0,
                        failed: 0,
                        total: 0
                    });
                });
            });
        });

        when("test runner has tree of tests", function () {
            var a = new Basil.Test('a');
            var aa = a.child('aa');
            var aaa = aa.child('aaa');  // leaf
            var ab = a.child('ab'); // leaf
            var b = new Basil.Test('b');  // leaf
            browserRunner.tests = function () { return [a, b]; };

            when("test tree is run", function () {
                sut.setup.call({}, function () { });

                then("only leaves are counted", function () {
                    expect(browserRunner.testCounts.total).to.equal(3);
                });
            });
        });

        when("test runner has a mixture of passing, failing & incomplete tests", function () {
            var pass = new Basil.Test();
            var fail = new Basil.Test();
            fail.hasPassed = function () { return false; };
            pass.isComplete = fail.isComplete = function () { return true; };
            var incomplete = new Basil.Test();
            browserRunner.tests = function () { return [pass, pass, pass, fail, fail, incomplete]; };

            when("test tree is run", function () {
                sut.setup.call({}, function () { });

                then("all passes counted", function () {
                    expect(browserRunner.testCounts.passed).to.equal(3);
                });

                then("all fails counted", function () {
                    expect(browserRunner.testCounts.failed).to.equal(2);
                });

                then("total includes all passed, failed & incomplete", function () {
                    expect(browserRunner.testCounts.total).to.equal(6);
                });
            });
        });
    });

    describe("Header state plugin", function () {
        var sut = Basil.headerStatePlugin(browserRunner);
        browserRunner.testCounts = { };

        when("page rendered", function () {
            sut.pageRender(this.dom);

            it("adds 'running' class to header", function () {
                expect(this.dom.className).to.contain("is-running");
            });

            when("tests are complete", function () {
                sut.onComplete();

                it("removes 'running' class from header", function () {
                    expect(this.dom.className).to.not.contain('is-running');
                })
            });

            when("there are failing tests", function () {
                browserRunner.testCounts.failed = 1;

                when("tests are complete", function () {
                    sut.onComplete();

                    it("adds 'failed' class to header", function () {
                        expect(this.dom.className).to.contain('is-failed');
                    });
                });
            });

            when("there are no failing tests", function () {
                browserRunner.testCounts.failed = 0;

                when("tests are complete", function () {
                    sut.onComplete();

                    it("doesn't add 'failed' class to header", function () {
                        expect(this.dom.className).to.not.contain('is-failed');
                    });
                });
            });
        });
    });

    describe("Big title plugin", function () {
        var location = { href: 'foo?bar', search: '?bar' };
        var sut = Basil.bigTitlePlugin(location);

        when("document has a title set", function () {
            document.title = 'baz';

            when("page rendered", function () {
                sut.pageRender(this.dom);

                then("title tag added to header", function () {
                    expect(this.dom.children.length).to.equal(1);
                });

                var title = this.dom.children[0];

                then("title tag contains document title", function () {
                    expect(title.innerText).to.equal('baz');
                });

                then("title tag links to current page without query string", function () {
                    expect(title.href).to.match(/\/foo$/);
                });
            });
        });

        when("document has no title set", function () {
            document.title = '';

            when("page rendered", function () {
                sut.pageRender(this.dom);

                then("title tag contents default to 'Basil'", function () {
                    expect(this.dom.children[0].innerText).to.equal('Basil');
                });
            });
        });
    });

    describe("Display test count plugin", function () {
        document.title = 'foo';
        var sut = Basil.displayTestCountPlugin(browserRunner);

        when("page rendered", function () {
            sut.pageRender(this.dom);

            then("passed, failed & total elements added to header", function () {
                expect(this.dom.querySelector('.basil-passes')).to.exist;
                expect(this.dom.querySelector('.basil-fails')).to.exist;
                expect(this.dom.querySelector('.basil-total ')).to.exist;
            });

            when("test runner includes test counts", function () {
                browserRunner.testCounts = { passed: 1, failed: 2, total: 3 };

                when("test tree run", function () {
                    sut.setup(function () { });

                    then("passes element updated", function () {
                        expect(this.dom.querySelector('.basil-passes').innerText).to.equal('1');
                    });

                    then("fails element updated", function () {
                        expect(this.dom.querySelector('.basil-fails').innerText).to.equal('2');
                    });

                    then("total element updated", function () {
                        expect(this.dom.querySelector('.basil-total').innerText).to.equal('3');
                    });

                    then("document title includes test counts", function () {
                        expect(document.title).to.equal('[1/2/3] foo');
                    });
                });
            });
        });
    });

    describe("Expand/collapse plugin", function () {
        var localStorage = {};
        var sut = Basil.expandCollapsePlugin(localStorage);

        describe("page rendering", function () {
            var header = document.createElement('div');
            var results = document.createElement('div');

            when("tests expanded by default", function () {
                localStorage.collapseAllTests = 'false';

                when("page rendered", function () {
                    sut.pageRender(header, results);

                    var container = header.children[0];

                    then("expand/collapse all container added to header", function () {
                        expect(container.className).to.contain('basil-expand-collapse-all');
                    });

                    var expandAll = container.children[0];
                    var collapseAll = container.children[1];

                    then("expand all label added to header", function () {
                        expect(expandAll).to.be.an.instanceOf(HTMLLabelElement);
                        expect(expandAll.innerText).to.equal('Expand all');
                    });

                    then("collapse all label added to header", function () {
                        expect(collapseAll).to.be.an.instanceOf(HTMLLabelElement);
                        expect(collapseAll.innerText).to.equal('Collapse all');
                    });

                    then("results marked as expanded by default", function () {
                        expect(results.className).to.contain('is-expanded-by-default')
                    });
                });
            });

            when("tests collapsed by default", function () {
                localStorage.collapseAllTests = 'true';

                when("page rendered", function () {
                    sut.pageRender(header, results);

                    then("results marked as collapsed by default", function () {
                        expect(results.className).to.contain('is-collapsed-by-default');
                    });
                });
            });
        });

        describe("test rendering", function () {
            var test = new Basil.Test('foo');

            when("test has no children", function () {
                when("test rendered", function () {
                    sut.testRender(this.dom, test);

                    then("expand collapse icon added to test element", function () {
                        expect(this.dom.children.length).to.equal(1);
                    });
                });
            });

            when("test has children", function () {
                test.child('foo');

                when("tests expanded by default", function () {
                    localStorage.collapseAllTests = 'false';

                    when("test rendered", function () {
                        sut.testRender(this.dom, test);
                        var icon = this.dom.children[0];

                        then("test is expanded", function () {
                            expect(this.dom.className).to.not.contain('is-collapsed');
                            isDownCaret(icon);
                        });

                        when("icon clicked", function () {
                            click(icon);

                            then("test is collapsed", function () {
                                expect(this.dom.className).to.contain('is-collapsed');
                                isRightCaret(icon);
                            });

                            when("icon clicked again", function () {
                                click(icon);

                                then("test is expanded", function () {
                                    expect(this.dom.className).to.not.contain('is-collapsed');
                                    isDownCaret(icon);
                                });
                            });
                        });
                    });
                });

                when("tests collapsed by default", function () {
                    localStorage.collapseAllTests = 'true';

                    when("test rendered", function () {
                        sut.testRender(this.dom, test);
                        var icon = this.dom.children[0];

                        then("test is collapsed", function () {
                            expect(this.dom.className).to.not.contain('is-expanded');
                            isRightCaret(icon);
                        });

                        when("icon clicked", function () {
                            click(icon);

                            then("test is expanded", function () {
                                expect(this.dom.className).to.contain('is-expanded');
                                isDownCaret(icon);
                            });

                            when("icon clicked again", function () {
                                click(icon);

                                then("test is collapsed", function () {
                                    expect(this.dom.className).to.not.contain('is-expanded');
                                    isRightCaret(icon);
                                });
                            });
                        });
                    });
                });
            });
        });

        describe("expand/collapse all", function () {
            var header = document.createElement('div');
            var results = document.createElement('div');
            var testElement = results.appendChild(document.createElement('div'));
            testElement.className = 'basil-test';
            var test = new Basil.Test('foo');
            test.child('bar');

            when("expanded by default", function () {
                localStorage.collapseAllTests = 'false';

                sut.pageRender(header, results);
                var expandAll = header.children[0].children[0];
                var collapseAll = header.children[0].children[1];
                sut.testRender(testElement, test);
                var testIcon = testElement.children[0];

                when("test expanded", function () {
                    when("collapse all clicked", function () {
                        click(collapseAll);

                        then("localStorage updated", function () {
                            expect(localStorage.collapseAllTests).to.equal('true');
                        });

                        then("results marked as collapsed by default", function () {
                            expect(results.className).to.contain('is-collapsed-by-default');
                            expect(results.className).to.not.contain('is-expanded-by-default');
                        });

                        then("test is collapsed", function () {
                            expect(testElement.className).to.not.contain('is-expanded');
                            isRightCaret(testIcon);
                        });
                    });
                });

                when("test collapsed", function () {
                    click(testIcon);

                    when("expand all clicked", function () {
                        click(expandAll);

                        then("localStorage updated", function () {
                            expect(localStorage.collapseAllTests).to.equal('false');
                        });

                        then("results marked as expanded by default", function () {
                            expect(results.className).to.contain('is-expanded-by-default');
                        });

                        then("test is expanded", function () {
                            expect(testElement.className).to.not.contain('is-collapsed');
                            isDownCaret(testIcon);
                        });
                    });
                });
            });
        });

        function isDownCaret(icon) {
            expect(icon.className).to.contain('icon-caret-down');
            expect(icon.className).to.not.contain('icon-caret-right');
        }

        function isRightCaret(icon) {
            expect(icon.className).to.not.contain('icon-caret-down');
            expect(icon.className).to.contain('icon-caret-right');
        }
    });

    describe("Passed/failed icon plugin", function () {
        var sut = Basil.passedFailedIconPlugin();
        var test = new Basil.Test();

        when("test has passed", function () {
            test.hasPassed = function () { return true; };

            when("test is rendered", function () {
                sut.testRender(this.dom, test);

                then("'passed' icon added to test element", function () {
                    expect(this.dom.children[0].className).to.contain('icon-ok');
                });
            });
        });

        when("test has failed", function () {
            test.hasPassed = function () { return false; };

            when("test is rendered", function () {
                sut.testRender(this.dom, test);

                then("'failed' icon added to test element", function () {
                    expect(this.dom.children[0].className).to.contain('icon-remove');
                });
            });
        });
    });

    describe("Test name plugin", function () {
        var sut = Basil.testNamePlugin();

        when("test is rendered", function () {
            var test = new Basil.Test('foo');
            sut.testRender(this.dom, test);

            then("test name added to test element", function () {
                expect(this.dom.innerText).to.equal('foo');
            });
        });
    });

    describe("Error text plugin", function () {
        var sut = Basil.errorTextPlugin();
        var test = new Basil.Test();
        this.dom.innerText = 'testName';

        when("test has no error", function () {
            when("test is rendered", function () {
                sut.testRender(this.dom, test);

                then("nothing added to test element", function () {
                    expect(this.dom.innerText).to.equal('testName');
                });
            });
        });

        when("test has an error", function () {
            var error = new Error('foo');
            test.error = function () { return error; };

            when("test is rendered", function () {
                sut.testRender(this.dom, test);

                then("error string added to test element", function () {
                    expect(this.dom.innerText).to.equal('testName (' + error + ')');
                });
            });
        });
    });

    describe("Filter plugin", function () {
        when("page is rendered", function () {
            var location = { href: 'baz', search: '?filter=foo&other=bar' };
            var sut = Basil.filterPlugin(browserRunner, location);
            var header = this.dom.appendChild(document.createElement('div'));
            sut.pageRender(header);

            var filterForm = header.children[0];
            filterForm.submit = sinon.spy();

            then("form added to header", function () {
                expect(filterForm).to.be.an.instanceOf(HTMLFormElement);
                expect(filterForm.innerText).to.equal('Filter');
            });

            then("filter form action is current page", function () {
                expect(filterForm.action).to.match(/\/baz$/);
            });

            var filterInput = header.children[0].children[0];

            then("filter search box added to header", function () {
                expect(filterInput).to.be.an.instanceOf(HTMLInputElement);
                expect(filterInput.name).to.equal('filter');
                expect(filterInput.type).to.equal('search');
            });

            then("filter search box contains query string filter", function () {
                expect(filterInput.value).to.equal('foo');
            });

            then("filter search box is focused", function () {
                expect(document.activeElement).to.equal(filterInput);
            });

            when("filter form is submitted", function () {
                browserRunner.abort = sinon.spy();
                filterForm.dispatchEvent(new Event('submit'));

                then("test runner is aborted", function () {
                    expect(browserRunner.abort).to.have.been.called;
                });
            });

            when("search event fired", function () {
                filterForm.dispatchEvent(new Event('search'));

                then("form is submitted", function () {
                    expect(filterForm.submit).to.have.been.called;
                });
            });

            when("test is rendered", function () {
                var test = new Basil.Test('testname');
                var testElement = document.createElement('div');
                sut.testRender(testElement, test);

                var icon = testElement.children[0];

                then("filter icon added to test element", function () {
                    expect(icon.className).to.contain('icon-filter');
                });

                when("icon is clicked", function () {
                    click(icon);

                    then("filter search box is populated with test key", function () {
                        expect(filterInput.value).to.equal(test.fullKey());
                    });

                    then("filter form is submitted", function () {
                        expect(filterForm.submit).to.have.been.called;
                    });
                });
            });
        });

        test("running tests", function () {
            when("test doesn't match filter", function () {
                var sut = filter('foo');
                var test = new Basil.Test('bar');
                sut.test(function () { }, test);

                then("test is skipped", function () {
                    expect(test.wasSkipped()).to.be.true;
                });
            });

            when("top-level test is partial match", function () {
                var sut = filter('foo');
                var test = new Basil.Test('barfoo');
                sut.test(function () { }, test);

                then("test is run", function () {
                    expect(test.wasSkipped()).to.be.false;
                });
            });

            when("top-level test matches first part of filter", function () {
                var sut = filter('foo>bar');
                var test = new Basil.Test('foo');
                sut.test(function () { }, test);

                then("test is run", function () {
                    expect(test.wasSkipped()).to.be.false;
                });
            });

            when("nested test is partial match", function () {
                var sut = filter('foo>bar');
                var test = new Basil.Test('foobar');
                sut.test(function () { sut.test(function () { }, test); }, new Basil.Test('foo'));

                then("test is run", function () {
                    expect(test.wasSkipped()).to.be.false;
                });
            });

            when("nested test doesn't match second part of filter", function () {
                var sut = filter('foo>bar');
                var test = new Basil.Test('baz');
                sut.test(function () { sut.test(function () { }, test); }, new Basil.Test('foo'));

                then("test is skipped", function () {
                    expect(test.wasSkipped()).to.be.true;
                });
            });

            function filter(filterValue) {
                var location = { href: 'baz', search: '?filter=' + filterValue };
                return Basil.filterPlugin(browserRunner, location);
            }
        });
    });

    describe("Inspect plugin", function () {
        var sut = Basil.inspectPlugin();

        when("test is not inspectable", function () {
            var test = new Basil.Test();

            when("test is rendered", function () {
                sut.testRender(this.dom, test);

                then("nothing added to test element", function () {
                    expect(this.dom.children.length).to.equal(0);
                });
            });
        });

        when("test is inspectable", function () {
            var test = new Basil.Test();
            test.inspect = sinon.stub().returns('test');
            test.inspectThisValue = {};

            when("test is rendered", function () {
                sut.testRender(this.dom, test);
                var icon = this.dom.children[0];

                then("inspect icon added to test element", function () {
                    expect(icon.className).to.contain('icon-signin');
                });

                when("icon is clicked", function () {
                    click(icon);

                    then("test is inspected", function () {
                        expect(test.inspect).to.have.been.called;
                        expect(test.inspect.thisValues[0]).to.equal(test.inspectThisValue);
                    });
                });
            });
        });
    });

    describe("View code plugin", function () {
        var sut = Basil.viewCodePlugin();

        when("test is not inspectable", function () {
            var test = new Basil.Test();

            when("test is rendered", function () {
                sut.testRender(this.dom, test);

                then("nothing added to test element", function () {
                    expect(this.dom.children.length).to.equal(0);
                });
            });
        });

        when("test is inspectable", function () {
            var test = new Basil.Test();
            test.inspect = function () {
                'foo';
            };

            when("test is rendered", function () {
                sut.testRender(this.dom, test);

                var icon = this.dom.children[0];

                then("view code icon added to test element", function () {
                    expect(icon.className).to.contain('icon-code');
                });

                var code = this.dom.children[1];

                then("code element added to test element", function () {
                    expect(code.tagName.toUpperCase()).to.equal('CODE');
                });

                then("code element not marked as visible", function () {
                    expect(code.className).to.not.contain('is-basil-code-visible');
                });

                then("code element contains inspect function contents", function () {
                    expect(code.innerHTML.trim()).to.equal("'foo';");
                });

                when("view code icon is clicked", function () {
                    click(icon);

                    then("code element is marked as visible", function () {
                        expect(code.className).to.contain('is-basil-code-visible');
                    });

                    when("view code icon is clicked again", function () {
                        click(icon);

                        then("code element is no longer marked as visible", function () {
                            expect(code.className).to.not.contain('is-basil-code-visible');
                        });
                    });
                });
            });
        });
    });

    describe("Hide passed plugin", function () {
        test("Page rendering", function () {
            var localStorage = { };
            var header = document.createElement('div');
            var results = document.createElement('div');

            when("passed tests not hidden in localStorage", function () {
                localStorage.isHidePassedChecked = 'false';
                var sut = Basil.hidePassedPlugin(localStorage);

                when("page is rendered", function () {
                    sut.pageRender(header, results);

                    var label = header.children[0];
                    var checkbox = label.children[0];

                    then("labelled checkbox is added to header", function () {
                        expect(label.tagName.toUpperCase()).to.equal('LABEL');
                        expect(label.innerText).to.equal('Hide Passed');
                        expect(checkbox).to.be.an.instanceOf(HTMLInputElement);
                        expect(checkbox.type).to.equal('checkbox');
                    });

                    then("checkbox is not checked", function () {
                        expect(checkbox.checked).to.be.false;
                    });

                    then("passed tests are shown", function () {
                        expect(results.className).to.not.contain('is-hiding-passed');
                    });

                    when("checkbox is changed", function () {
                        checkbox.checked = true;
                        checkbox.dispatchEvent(new Event('change'));

                        then("localStorage is updated", function () {
                            expect(localStorage.isHidePassedChecked).to.be.equal('true');
                        });

                        then("passed tests are hidden", function () {
                            expect(results.className).to.contain('is-hiding-passed');
                        });
                    });
                });
            });

            when("passed tests are hidden in localStorage", function () {
                localStorage.isHidePassedChecked = 'true';
                var sut = Basil.hidePassedPlugin(localStorage);

                when("page is rendered", function () {
                    sut.pageRender(header, results);

                    var checkbox = header.children[0].children[0];

                    then("hide passed checkbox is checked", function () {
                        expect(checkbox.checked).to.be.true;
                    });

                    then("passed tests are hidden", function () {
                        expect(results.className).to.contain('is-hiding-passed');
                    });

                    when("checkbox is changed", function () {
                        checkbox.checked = false;
                        checkbox.dispatchEvent(new Event('change'));

                        then("localStorage is updated", function () {
                            expect(localStorage.isHidePassedChecked).to.be.equal('false');
                        });

                        then("passed tests are shown", function () {
                            expect(results.className).to.not.contain('is-hiding-passed');
                        });
                    });
                });
            });
        });

        test("Test rendering", function () {
            var test = new Basil.Test();
            var sut = Basil.hidePassedPlugin();

            when("test has passed", function () {
                test.hasPassed = function () { return true; };

                when("test is rendered", function () {
                    sut.testRender(this.dom, test);

                    then("test element marked as passed", function () {
                        expect(this.dom.className).to.contain('is-passed');
                    });
                });
            });

            when("test has failed", function () {
                test.hasPassed = function () { return false; };

                when("test is rendered", function () {
                    sut.testRender(this.dom, test);

                    then("test element marked as failed", function () {
                        expect(this.dom.className).to.contain('is-failed');
                    });
                });
            });
        });
    });

    describe("Notifications plugin", function () {
        when("notifications not available", function () {
            var sut = Basil.notificationPlugin(browserRunner);

            when("page rendered", function () {
                sut.pageRender(this.dom);

                then("nothing added to header", function () {
                    expect(this.dom.children.length).to.equal(0);
                });
            });
        });

        when("notifications are available", function () {
            var PERMISSION_ALLOWED = 0,
                PERMISSION_NOT_ALLOWED = 1;
            var notifications = {
                checkPermission: sinon.stub(),
                requestPermission: sinon.stub(),
                createNotification: sinon.stub().returns({
                    show: sinon.spy(),
                    cancel: sinon.spy()
                })
            };
            document.title = 'foo';
            var sut = Basil.notificationPlugin(browserRunner, notifications);

            when("notifications are not allowed", function () {
                notifications.checkPermission.returns(PERMISSION_NOT_ALLOWED);

                when("page rendered", function () {
                    sut.pageRender(this.dom);

                    var notificationsLabel = this.dom.children[0];

                    then("notifications label added to header", function () {
                        expect(notificationsLabel.textContent).to.equal('Enable notifications');
                    });

                    when("notifications label clicked", function () {
                        click(notificationsLabel);

                        then("notification permission is requested", function () {
                            expect(notifications.requestPermission).to.have.been.called;
                        });
                    });
                });
            });

            when("notifications are allowed", function () {
                notifications.checkPermission.returns(PERMISSION_ALLOWED);

                when("page rendered", function () {
                    sut.pageRender(this.dom);

                    then("nothing added to header", function () {
                        expect(this.dom.children.length).to.equal(0);
                    });
                });

                when("no failed tests", function () {
                    browserRunner.testCounts = { passed: 1, failed: 0, total: 1 };

                    when("tests are complete", function () {
                        sut.onComplete();

                        then("notification is created", function () {
                            expect(notifications.createNotification).to.have.been.called;
                        });

                        var createNotification = notifications.createNotification.lastCall;
                        var createNotificationArgs = createNotification.args;
                        var notification = createNotification.returnValue;

                        then("notification has passed icon", function () {
                            expect(createNotificationArgs[0]).to.equal(sut._passedIcon);
                        });

                        then("notification title matches document title", function () {
                            expect(createNotificationArgs[1]).to.equal('foo');
                        });

                        then("notification text has passing message", function () {
                            expect(createNotificationArgs[2]).to.equal('All 1 tests passed!');
                        });

                        then("notification is shown", function () {
                            expect(notification.show).to.have.been.called;
                        });

                        when("1 second has elapsed", function () {
                            this.clock.tick(1000);

                            then("notification is hidden", function () {
                                expect(notification.cancel).to.have.been.called;
                            });
                        });

                        when("window closed", function () {
                            window.dispatchEvent(new Event('beforeunload'));

                            then("notification is hidden", function () {
                                expect(notification.cancel).to.have.been.called;
                            });
                        });
                    });
                });

                when("some failed tests", function () {
                    browserRunner.testCounts = { passed: 1, failed: 1, total: 2 };
                    var error = new Error('foo');
                    var failedTest = new Basil.Test();
                    failedTest.error = function () { return error; };
                    browserRunner.tests = function () { return [failedTest]; };

                    when("tests are complete", function () {
                        sut.onComplete();

                        var createNotification = notifications.createNotification.lastCall;
                        var createNotificationArgs = createNotification.args;
                        var notification = createNotification.returnValue;

                        then("notification has failed icon", function () {
                            expect(createNotificationArgs[0]).to.equal(sut._failedIcon);
                        });

                        then("notification text has failing message", function () {
                            expect(createNotificationArgs[2]).to.equal('1 of 2 failed.\n' + error);
                        });

                        when("1 second has elapsed", function () {
                            this.clock.tick(1000);

                            then("notification not hidden yet", function () {
                                expect(notification.cancel).to.not.have.been.called;
                            });
                        });

                        when("longer time has elapsed", function () {
                            this.clock.tick(2000);  // Not going to test specific time calculation

                            then("notification is hidden", function () {
                                expect(notification.cancel).to.have.been.called;
                            });
                        });
                    });
                });
            });
        });
    });

    function click(el) {
        el.dispatchEvent(new MouseEvent('click'));
    }
});
