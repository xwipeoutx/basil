# basil

~~Java~~TypeScript test runner with hierarchical setup

```css
Warning: This branch is under heavy development. Trust nothing. 
```

## Example test (basil + chai.js)

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
