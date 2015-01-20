var assert = require("assert");

function Test(name) {
    this.name = name;
    this.testcases = [];

    for(var i=1; i<arguments.length; i++) {
        this.testcase(arguments[i]);
    }
}

Test.prototype.testcase = function(tc) {
    this.testcases.push(tc);
};

function TestCase(name, cbs) {
    this.name = name;
    this.cbs = [];

    for(var i=1; i<arguments.length; i++) {
        this.use(arguments[i]);
    }
}

TestCase.prototype.use = function(cb) {
    this.cbs.push(cb);
};

function TestCaseContext(test, testcase, cb) {
    this._index = -1;
    this._test = test;
    this._testcase = testcase;
    this._cb = cb;
    this.error = null;
}

// Proxy all of the assert functions
Object.keys(assert).forEach(function(key) {
    TestCaseContext.prototype[key] = function() {
        try {
            assert[key].apply(assert, arguments);
        } catch(e) {
            this.error = e;
        }
    };
});

TestCaseContext.prototype.next = function() {
    this._index += 1;

    if(this.error || this._index >= this._testcase.cbs.length) {
        this._cb();
    } else {
        this._testcase.cbs[this._index].call(this);
    }
};

TestCaseContext.prototype.done = function() {
    this._cb();
};

module.exports = {
    Test: Test,
    TestCase: TestCase,
    TestCaseContext: TestCaseContext
};
