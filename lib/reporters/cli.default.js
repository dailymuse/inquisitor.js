var utils = require("../utils");
var coolors = require("coolors");

// Default reporter. Dumps results to stdout.
function DefaultCliReporter(verbose) {
    // Mapping of { test name => { testcase name => [testcase results] } }.
    // Currently assumes that every test has a distinct name, and that every
    // testcase within that test has a distinct name. However, inquisitor
    // itself allows you to break this.
    this._results = {};

    // Whether to show verbose output, i.e. whether error stack traces should
    // be displayed
    this.verbose = verbose;
}

// Adds a test runner to the reporter
DefaultCliReporter.prototype.add = function(runner) {
    // Listen for testcase completion
    runner.on("testcase:end", function(context) {
        // Print some progress so the user knows we're not stalled
        process.stdout.write(".");

        //Add the testcase results
        var outerContainer = this._results[context._test.name];

        if(outerContainer == undefined) {
            outerContainer = this._results[context._test.name] = {};
        }

        var innerContainer = outerContainer[context._testcase.name];

        if(innerContainer == undefined) {
            innerContainer = outerContainer[context._testcase.name] = [];
        }

        innerContainer.push(context);
    }.bind(this));
};

// Print out the completed report
DefaultCliReporter.prototype.finish = function() {
    // Number of testcases that passed
    var passedCount = 0;

    // Number of testcases that failed
    var failedCount = 0;

    // Shows the results of a testcase execution
    var showStatus = function(color, status, testcaseResults) {
        var text = status;

        if(testcaseResults.length > 1) {
            var passedCount = 0;
            var failedCount = 0;

            testcaseResults.forEach(function(testcaseResult) {
                if(testcaseResult.error) {
                    failedCount++;
                } else {
                    passedCount++;
                }
            });

            text += " [" + passedCount + "/" + (passedCount + failedCount) + "]";
        }

        console.log(coolors(text, color));
    };

    // Iterate through each test...
    Object.keys(this._results).forEach(function(testName) {
        console.log("\n" + testName);
        var testResults = this._results[testName];

        // Iterate through each testcase...
        Object.keys(testResults).forEach(function(testcaseName) {
            var testcaseResults = testResults[testcaseName];
            var overallFailed = false;

            // The testcase failed if any of its executions produced an error
            testcaseResults.forEach(function(testcaseResult) {
                if(testcaseResult.error) {
                    overallFailed = true;
                }
            });

            // Print the status
            if(overallFailed) {
                failedCount++;
                showStatus("red", "✖ " + testcaseName, testcaseResults);

                // Print stack traces if verbose output is enabled
                if(this.verbose) {
                    testcaseResults.forEach(function(testcaseResult) {
                        if(testcaseResult.error) {
                            console.log(utils.indent(testcaseResult.error.stack, 2));
                        }
                    });
                }
            } else {
                passedCount++;
                showStatus("green", "✔ " + testcaseName, testcaseResults);
            }
        }, this);
    }, this);

    // Print overall results
    console.log(coolors("\n" + passedCount + " passed, " + failedCount + " failed.", failedCount > 0 ? "red" : "green"));

    if(failedCount > 0) {
        process.exit(1);
    }
}

module.exports = DefaultCliReporter;
