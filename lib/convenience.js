var objects = require("./objects");
var middleware = require("./middleware");

// Convenience method for creating a testcase that executes HTTP requests.
// Pass in a name and one or more middleware functions.
function testcase(name) {
    var testcase = new objects.TestCase(name, middleware.requestor);

    for(var i=1; i<arguments.length; i++) {
        testcase.use(arguments[i]);
    }

    return testcase;
}

module.exports = {
    testcase: testcase
};
