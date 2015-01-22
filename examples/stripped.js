// A simple "hello world" example. This doesn't actually make any HTTP calls,
// and it circumvents some of the convenience methods provided by inquisitor.
// Consequently, it's less of an example, and more a demonstration of how
// a testcase that jumps through the least number of abstractions would
// operate.

var inquisitor = require("../lib");

module.exports = new inquisitor.Test(
    "HelloWorldTest",
    new inquisitor.TestCase("helloWorld", function() {
        this.ok(true, "woo!");
        this.next();
    })
);
