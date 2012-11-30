Teapot = function() {
    this._hasWater = false;
};
Teapot.prototype = {
    isEmpty: function() {
        return !this._hasWater;
    },

    addWater: function() {
        if (this._hasWater)
            throw new CannotAddWaterError();

        this._hasWater = true;
    },

    drain: function() {
        this._hasWater = false;
    }
};

CannotAddWaterError = function() { this.message = "Cannot add water - it's already full!"; };
CannotAddWaterError.prototype = Object.create(Error.prototype);