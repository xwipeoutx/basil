"use strict";
var Bird = (function () {
    function Bird() {
        this.flyStartTime = null;
        this.numLegs = 2;
        this.numWings = 2;
    }
    Object.defineProperty(Bird.prototype, "isFlying", {
        get: function () {
            return this.flyStartTime != null
                && this.flyStartTime < +new Date();
        },
        enumerable: true,
        configurable: true
    });
    Bird.prototype.flap = function () {
        if (this.numWings == 0)
            throw new Error("Wings are broken, cannot fly");
        this.flyStartTime = +new Date();
    };
    Bird.prototype.hitTree = function () {
        this.flyStartTime = null;
        this.numWings = 0;
    };
    return Bird;
}());
exports.Bird = Bird;
