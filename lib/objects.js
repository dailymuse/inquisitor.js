var assert = require("assert");

// Creates a new test based on the given name
function Test(name) {
    this.name = name;
    this.testcases = [];

    for(var i=1; i<arguments.length; i++) {
        this.testcase(arguments[i]);
    }
}

// Adds a testcase to this test
Test.prototype.testcase = function(tc) {
    this.testcases.push(tc);
};

// Creates a new testcase with the given name and callbacks
function TestCase(name) {
    this.name = name;
    this.cbs = [];

    for(var i=1; i<arguments.length; i++) {
        this.use(arguments[i]);
    }
}

// Adds a callback to this testcase
TestCase.prototype.use = function(cb) {
    this.cbs.push(cb);
};

// Manages the execution of a testcase
function TestCaseContext(test, testcase, cb) {
    // The index of the currently executing callback
    this._index = -1;

    // A reference to the parent test
    this._test = test;

    // A reference to the testcase this context is running
    this._testcase = testcase;

    // The callback to run after a test is complete
    this._cb = cb;

    // The error that occurred while running this testcase
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

// Run the next callback in the testcase
TestCaseContext.prototype.next = function() {
    this._index += 1;

    if(this.error || this._index >= this._testcase.cbs.length) {
        this._cb();
    } else {
        this._testcase.cbs[this._index].call(this);
    }
};

// Finishes the testcase execution
TestCaseContext.prototype.done = function() {
    this._cb();
};

module.exports = {
    Test: Test,
    TestCase: TestCase,
    TestCaseContext: TestCaseContext
};
