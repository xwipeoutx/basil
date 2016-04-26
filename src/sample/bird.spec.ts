// Grebe imports
import { describe, when, then, it } from "../grebe";

// third-party imports for assertions and mocking
import { expect, should } from "chai";
import * as sinon from "sinon";
should(); // setup Object.prototype.should

// Test-specific imports
import { Bird } from "./bird";

describe("Bird", () => {
    // sinon override for Date, setTimeout etc.
    var clock = sinon.useFakeTimers();

    // sut stands for "System Under Test"
    var sut = new Bird(); 

    // initial state assertions
    it("has 2 legs", () => {
        sut.numLegs.should.equal(2);
    });

    it("has 2 wings", () => {
        sut.numWings.should.equal(2);
    });

    it("starts on ground", () => {
        sut.isFlying.should.be.false;
    });

    // when = perform an action
    when("flapping wings", () => {
        sut.flap();

        // assertions at any level
        it("is not yet flying", () => {
            sut.isFlying.should.be.false;
        });

        // nest as far as you want
        when("1s passes", () => {
            clock.tick(1000);

            it("is flying", () => {
                sut.isFlying.should.be.true;
            });
            
            // keep nesting...
            when("it hits a tree", () => {
                sut.hitTree();
                
                it("is not flying", () => {
                    sut.isFlying.should.be.false;
                });
                
                it("loses wings", () => {
                    sut.numWings.should.equal(0);
                })
                
                it("cannot fly again", () => {
                    expect(() => sut.flap()).to.throw("Wings are broken, cannot fly");
                });
            });
        });
    });
    
    // cleanup code run after every test, regardless of exceptions.  
    // In this case, restore the sinon clock.
    clock.restore();
});