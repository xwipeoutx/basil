"use strict";
// Grebe imports
var spec_1 = require("../spec");
//import { describe, when, then, it } from "grebe/spec"; // Use this instead when not bootstrapping
// third-party imports for assertions and mocking
var chai_1 = require("chai");
var sinon = require("sinon");
chai_1.should(); // setup Object.prototype.should
// Test-specific imports
var bird_1 = require("./bird");
spec_1.describe("Bird", function () {
    // sinon override for Date, setTimeout etc.
    var clock = sinon.useFakeTimers();
    // sut stands for "System Under Test"
    var sut = new bird_1.Bird();
    // initial state assertions
    spec_1.it("has 2 legs", function () {
        sut.numLegs.should.equal(2);
    });
    spec_1.it("has 2 wings", function () {
        sut.numWings.should.equal(2);
    });
    spec_1.it("starts on ground", function () {
        sut.isFlying.should.be.false;
    });
    // when = perform an action
    spec_1.when("flapping wings", function () {
        sut.flap();
        // assertions at any level
        spec_1.it("is not yet flying", function () {
            sut.isFlying.should.be.false;
        });
        // nest as far as you want
        spec_1.when("1s passes", function () {
            clock.tick(1000);
            spec_1.it("is flying", function () {
                sut.isFlying.should.be.true;
            });
            // keep nesting...
            spec_1.when("it hits a tree", function () {
                sut.hitTree();
                spec_1.it("is not flying", function () {
                    sut.isFlying.should.be.false;
                });
                spec_1.it("loses wings", function () {
                    sut.numWings.should.equal(0);
                });
                spec_1.it("cannot fly again", function () {
                    chai_1.expect(function () { return sut.flap(); }).to.throw("Wings are broken, cannot fly");
                });
            });
        });
    });
    // cleanup code run after every test, regardless of exceptions.  
    // In this case, restore the sinon clock.
    clock.restore();
});
