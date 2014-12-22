class Test {
    private _runCount : number = 0;
    private _children : any; // NOCOMMIT should be a map or something
    private _error : string = null;
    private _skipped : boolean = false;
    private _isComplete : boolean = false;
    private _inspect : (context : Object) => void = null;
    private _inspectContext : any = null;

    constructor(private _name : string, private _parent : Test) {
        this._children = {};
    }

    get name() : string {
        return this._name;
    }

    get key() : string {
        return this._name.toLowerCase().replace(/>/g, '');
    }

    get fullKey() : string {
        return this._parent
            ? this._parent.fullKey + '>' + this.key
            : this.key;
    }

    get isComplete() : boolean {
        return this._skipped
            || this._isComplete
            || (this._isComplete = this._runCount > 0
            && this.children.every(child => child.isComplete));
    }

    run(fn : (context : Object) => void, thisValue : Object) : void {
        if (this._skipped)
            return;

        try {
            fn.call(thisValue);
        } catch (error) {
            if (!(error instanceof Error))
                error = new Error(error);
            this._error = error;
            this._inspect = fn;
            this._inspectContext = thisValue;
        }
        this._runCount++;
    }

    skip() : void {
        this._skipped = true;
    }

    get wasSkipped() : boolean {
        return this._skipped;
    }

    get runCount() : number {
        return this._runCount;
    }

    child(name : string) : Test {
        if (this._children[name])
            return this._children[name];

        return this._children[name] = new Test(name, this);
    }

    get children() : Test[] {
        return Object.keys(this._children)
            .map(key => this._children[key] );
    }

    get hasPassed() : boolean {
        return this.isComplete
            && this.children.every(child => child.hasPassed)
            && this._error == null;
    }

    get error() : string {
        return this._error;
    }

    inspect() : void {
        debugger;
        this._inspect(this._inspectContext); // Step into this
    }

    get code() : string {
        return this._inspect.toString();
    }
};
