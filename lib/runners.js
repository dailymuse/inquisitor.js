var util = require("util");
var events = require("events");
var objects = require("./objects");
var Reporter = require("./reporters/cli.default");

// Runs one or more tests
function Runner(tests) {
    this.tests = tests;
}

util.inherits(Runner, events.EventEmitter);

// Runs a given test, calling `cb` when the test is completed
Runner.prototype._runTest = function(test, cb) {
    this.emit("test:begin", test);
    var i = -1;
    var testcase = null;
    var context = null;

    // Function to run the next testcase
    var next = function() {
        // Emit an event about the last testcase completing
        if(testcase != null && context != null) {
            this.emit("testcase:end", context);
        }

        i += 1;

        if(i >= test.testcases.length) {
            // All of the testcases have run. Wrap up.
            this.emit("test:end", test);
            cb();
        } else {
            // Run the next testcase
            testcase = test.testcases[i];
            context = new objects.TestCaseContext(test, testcase, next);
            this.emit("testcase:begin", context);
            context.next();
        }
    }.bind(this);

    // Call the first testcase
    next();
};

// Runs the tests
Runner.prototype.run = function() {
    this.emit("execution:begin");

    var i = -1;

    // Function to run the next test
    var next = function() {
        i += 1;

        if(i >= this.tests.length) {
            // All of the tests have run. Wrap up.
            this.emit("execution:end");
        } else {
            // Run the next test
            this._runTest(this.tests[i], next);
        }
    }.bind(this);

    next();
};

// Runs a single pass of all of the tests
function testrunner(tests) {
    var runner = new Runner(tests);
    var reporter = new Reporter(true);
    reporter.add(runner);

    runner.on("execution:end", function() {
        reporter.finish();
    });

    runner.run();
}

// Runs a load test. Each test is run `count` times, and within each run, each
// testcase is executed `runs` times.
function loadrunner(tests, count, runs) {
    var reporter = new Reporter(false);
    var countLeft = count;

    for(var i=0; i<count; i++) {
        // Function to run a single execution of all of the tests
        (function() {
            var runsLeft = runs;

            // Function to run to run a single test
            var next = function() {
                var runner = new Runner(tests);
                reporter.add(runner);

                runner.on("execution:end", function() {
                    runsLeft -= 1;

                    if(runsLeft > 0) {
                        next();
                    } else {
                        countLeft -= 1;

                        if(countLeft == 0) {
                            reporter.finish();
                        }
                    }
                });

                runner.run();
            };

            next();
        })();
    }
}

module.exports = {
    Runner: Runner,
    testrunner: testrunner,
    loadrunner: loadrunner
};
