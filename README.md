basil
=====

Javascript test runner with hierarchical setup

Description
-----------
See, a problem with writing unit tests is that setup is hard.  Very hard. Unless you're very diligent with your test fixtures and set up, you can quickly code your tests to be a giant ball of spaghetti.

Basil fixes this, allowing hierarchical and inline test setup without sacrificing readability.

Don't believe me? See a [sample test](http://stevesspace.com/projects/basil/samples/sample-test.html) for yourself. Or see the [handy debug](http://stevesspace.com/projects/basil/samples/sample-output-test.html) features for when tests fail

Features:

* Fully hierarchical test setup
* Choose your own mocking and assertion library (I recommend chai.js and sinon.js)
* Instantly inspect the state of the system under test at the time of failure (must have a debugger attached)
* View the code of the failing line of code
* Easy to extend or integrate into build processes or IDEs
* Ridiculously easy reading tests - almost reads like a test script

Example test (basil + chai.js)
------------------------------

    describe("Teapot", function() {
        var teapot = new Teapot();

        it("starts with no water", function() {
            expect(teapot.isEmpty()).to.be.true;
        });

        when("no water", function() {
            when("adding water", function() {
                teapot.addWater();

                then(function() { expect(teapot.isEmpty()).to.be.false; });
            });
        });

        when("has water", function() {
            teapot.addWater();

            then(function() { expect(teapot.isEmpty()).to.be.false; });

            it("cannot have water added", function() {
                expect(function() {
                    teapot.addWater();
                }).to.throw(CannotAddWaterError)
            });

            when("drained", function() {
                teapot.drain();

                then(function() { expect(teapot.isEmpty()).to.be.true; });
            });
        });
    });
