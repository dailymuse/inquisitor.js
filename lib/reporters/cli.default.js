var utils = require("../utils");
var coolors = require("coolors");

function DefaultCliReporter(verbose) {
    this._results = {};
    this.verbose = verbose;
}

DefaultCliReporter.prototype.add = function(runner) {
    runner.on("testcase:end", function(context) {
        process.stdout.write(".");

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

DefaultCliReporter.prototype.finish = function() {
    var passedCount = 0;
    var failedCount = 0;

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

    Object.keys(this._results).forEach(function(testName) {
        console.log("\n" + testName);
        var testResults = this._results[testName];

        Object.keys(testResults).forEach(function(testcaseName) {
            var testcaseResults = testResults[testcaseName];
            var overallFailed = false;

            testcaseResults.forEach(function(testcaseResult) {
                if(testcaseResult.error) {
                    overallFailed = true;
                }
            });

            if(overallFailed) {
                failedCount++;
                showStatus("red", "✖ " + testcaseName, testcaseResults);

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

    console.log(coolors("\n" + passedCount + " passed, " + failedCount + " failed.", failedCount > 0 ? "red" : "green"));
}

module.exports = DefaultCliReporter;
