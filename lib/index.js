var objects = require("./objects");
var runners = require("./runners");
var middleware = require("./middleware");
var convenience = require("./convenience");

module.exports = {
    Test: objects.Test,
    TestCase: objects.TestCase,
    TestCaseContext: objects.TestCaseContext,

    Runner: runners.Runner,
    testrunner: runners.testrunner,
    loadrunner: runners.loadrunner,

    cli: require("./cli"),

    requestor: middleware.requestor,
    makeRequest: middleware.makeRequest,
    expectJson: middleware.expectJson,
    matchCode: middleware.matchCode,
    matchJson: middleware.matchJson,

    testcase: convenience.testcase,

    reporters: {
        "cli.default": require("./reporters/cli.default")
    }
};
