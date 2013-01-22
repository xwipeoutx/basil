describe("in describe root", function() {
    expect(this.spy).to.exist;
});

describe("in nested stuff", function() {
    when("in a when", function() {
        then(function() { expect(this.spy).to.exist} );
    });
});

describe("test failures", function() {
    var obj = { fn: function() {}};

    when("spying", function() {
        var spy = this.spy(obj, 'fn');

        when("not called", function() {
            it("throws an exception when asserted on", function() {
                expect(function() {
                    sinon.assert.calledOnce(spy);
                }).to.throw('expected fn to be called once but was called 0 times');
            });
        });

        when("called", function() {
            obj.fn();

            it("does not throw an exception when asserted on", function() {
                expect(function() {
                    sinon.assert.calledOnce(spy);
                }).to.not.throw();
            });
        });

    })
});