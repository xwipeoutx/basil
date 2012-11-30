(function() {
    function pass(name) {
        it("passing " + name, function() {
            expect(true).to.be.true;
        });
    }

    function fail(name) {
        it("failing " + name, function() {
            expect(true).to.be.false;
        });
    }

    describe("all passing context", function() {
        pass("it number 1");
        pass("it number 2");

        when("when number 1",function() {
            pass("it number 1");
            pass("it number 2");

            when("nested when number 1",function() {
                pass("it number 1");
                pass("it number 2");
            });

            when("nested when number 2",function() {
                pass("it number 1");
                pass("it number 2");
            });
        });

        when("when number 2",function() {
            pass("it number 1");
            pass("it number 2");

            when("nested when number 1",function() {
                pass("it number 1");
                pass("it number 2");
            });
        });
    });

    describe("all failing context", function() {
        fail("it number 1");
        fail("it number 2");

        when("when number 1",function() {
            fail("it number 1");
            fail("it number 2");

            when("nested when number 1",function() {
                fail("it number 1");
                fail("it number 2");
            });

            when("nested when number 2",function() {
                fail("it number 1");
                fail("it number 2");
            });
        });

        when("when number 2",function() {
            fail("it number 1");
            fail("it number 2");

            when("nested when number 1",function() {
                fail("it number 1");
                fail("it number 2");
            });
        });
    });

    describe("some failing context", function() {
        fail("it number 1");
        pass("it number 2");

        when("when number 1",function() {
            pass("it number 1");
            pass("it number 2");

            when("nested when number 1",function() {
                pass("it number 1");
                fail("it number 2");
            });

            when("nested when number 2",function() {
                pass("it number 1");
                fail("it number 2");
            });
        });

        when("when number 2",function() {
            fail("it number 1");
            fail("it number 2");

            when("nested when number 1",function() {
                pass("it number 1");
                pass("it number 2");
            });
        });
    });
})();
