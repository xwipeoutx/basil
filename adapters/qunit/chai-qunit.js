(function(global) {

    QUnit.assert = {};
    override('ok', chai.assert.ok);
    override('equal', chai.assert.equal);
    override('deepEqual', chai.assert.deepEqual);
    override('strictEqual', chai.assert.strictEqual);
    override('notStrictEqual', chai.assert.notStrictEqual);

    function override(name, chaiEquivalent) {
        var qunitAssertFn = function() {
            QUnit.current.numAsserts++;
            chaiEquivalent.apply(this, arguments);
        };

        QUnit.assert[name] = QUnit[name] = global[name] = qunitAssertFn;

    }

})(this);