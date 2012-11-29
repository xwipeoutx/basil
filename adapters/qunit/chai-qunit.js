(function(global) {
    QUnit.assert = {};
    override('ok', chai.assert.ok);
    override('equal', chai.assert.equal);
    override('deepEqual', chai.assert.deepEqual);
    override('strictEqual', chai.assert.strictEqual);
    override('notStrictEqual', chai.assert.notStrictEqual);
    override('throws',qunitThrows );
    override('raises',qunitThrows );
    override('push', function(expression, actual, expected, message) {
        chai.assert(expression, message);
    });
    override('propEqual', function() {
        chai.assert(false, '"propEqual"is  not supported for Chai-Basil bridge');
    });

    function qunitThrows(fn, expected, message) {
        if (typeof expected == 'function')
            return;

        fn = fn.bind(QUnit.current_testEnvironment);
        chai.assert.throws.call(this, fn, expected, message);
    }

    function override(name, chaiEquivalent) {
        var qunitAssertFn = function() {
            QUnit.current_testEnvironment.numAsserts++;
            chaiEquivalent.apply(this, arguments);
        };

        QUnit.assert[name] = QUnit[name] = global[name] = qunitAssertFn;
    }
})(this);