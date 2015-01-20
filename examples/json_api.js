var catnap = require("./lib");
var m = catnap.middleware;

var test = new catnap.Test("JsonTest");

function sendEcho() {
    this.request("http://echo.jsontest.com/key/value/one/two");
}

function receiveEcho() {
    this.deepEqual(this.responseJson, {
        one: "two",
        key: "value"
    });

    this.next();
}

test.testcase(new catnap.TestCase("echo", m.request, sendEcho, m.expectJson, receiveEcho));

module.exports = test;
