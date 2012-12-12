describe("Teapot", function() {
    var teapot = new Teapot();

    it("starts with no water", function() {
        expect(teapot.isEmpty()).to.be.true;
    });

    when("no water", function() {
        when("adding water", function() {
            teapot.addWater();

            it(function() { expect(teapot.isEmpty()).to.be.false; });
        });
    });

    when("has water", function() {
        teapot.addWater();

        it(function() { expect(teapot.isEmpty()).to.be.false; });

        it("cannot have water added", function() {
            expect(function() {
                teapot.addWater();
            }).to.throw(CannotAddWaterError)
        });

        when("drained", function() {
            teapot.drain();

            it(function() { expect(teapot.isEmpty()).to.be.true; });
        });
    });
});