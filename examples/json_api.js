// Tests that a simple, JSON-based API returns the proper results

var inq = require("../lib");
var test = new inq.Test("JsonTest");

test.testcase(inq.testcase("echo",
    inq.makeRequest("http://echo.jsontest.com/key/value/one/two"),
    inq.expectJson,
    inq.matchCode(200),
    inq.matchJson({
        one: "two",
        key: "value"
    })
));

module.exports = test;
