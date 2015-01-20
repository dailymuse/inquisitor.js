var util = require("util");
var events = require("events");
var objects = require("./objects");
var Reporter = require("./reporters/cli.default");

function Runner(tests) {
    this.tests = tests;
}

util.inherits(Runner, events.EventEmitter);

Runner.prototype._runTest = function(test, cb) {
    this.emit("test:begin", test);
    var i = -1;
    var testcase = null;
    var context = null;

    var next = function() {
        if(testcase != null && context != null) {
            this.emit("testcase:end", context);
        }

        i += 1;

        if(i >= test.testcases.length) {
            this.emit("test:end", test);
            cb();
        } else {
            testcase = test.testcases[i];
            context = new objects.TestCaseContext(test, testcase, next);
            this.emit("testcase:begin", context);
            context.next();
        }
    }.bind(this);

    next();
};

Runner.prototype.run = function() {
    this.emit("execution:begin");

    var i = -1;

    var next = function() {
        i += 1;

        if(i >= this.tests.length) {
            this.emit("execution:end");
        } else {
            this._runTest(this.tests[i], next);
        }
    }.bind(this);

    next();
};

function testrunner(tests) {
    var runner = new Runner(tests);
    var reporter = new Reporter(true);
    reporter.add(runner);

    runner.on("execution:end", function() {
        reporter.finish();
    });

    runner.run();
}

function loadrunner(tests, count, runs) {
    var reporter = new Reporter(false);
    var countLeft = count;

    for(var i=0; i<count; i++) {
        (function() {
            var runsLeft = runs;

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
