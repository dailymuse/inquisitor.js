var inquisitor = require("./lib");

// A simple "hello world" example. This doesn't actually make any HTTP calls,
// but rather serves as a minimal example.
module.exports = new inquisitor.Test(
    "HelloWorldTest",
    new inquisitor.TestCase("helloWorld", function() {
        this.ok(true, "woo!");
        this.next();
    })
);
