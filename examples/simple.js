var catnap = require("./lib");

// A simple "hello world" example. This doesn't actually make any HTTP calls,
// but rather serves as a minimal example.
module.exports = new catnap.Test(
    "HelloWorldTest",
    new catnap.TestCase("helloWorld", function() {
        this.ok(true, "woo!");
        this.next();
    })
);
