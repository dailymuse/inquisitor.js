var catnap = require("./lib");
var m = catnap.middleware;

// Tests that a simple, JSON-based API returns the proper results
var test = new catnap.Test("JsonTest");

// Makes the request to the JSON API
function sendEcho() {
    this.request("http://echo.jsontest.com/key/value/one/two");
}

// Checks the response
function receiveEcho() {
    this.deepEqual(this.responseJson, {
        one: "two",
        key: "value"
    });

    this.next();
}

test.testcase(new catnap.TestCase("echo", m.request, sendEcho, m.expectJson, receiveEcho));

module.exports = test;
