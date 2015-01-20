var catnap = require("./lib");

module.exports = new catnap.Test(
    "HelloWorldTest",
    new catnap.TestCase("helloWorld", function() {
        this.ok(true, "woo!");
        this.next();
    })
);
