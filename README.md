# Inquisitor ![npm package](https://nodei.co/npm/inquisitor.js.png?mini=true)

Inquisitor is a tool that allows you to define assertion-based tests against
your HTTP API. These tests can then be run as a single pass to facilitate
integration testing, or they can be executed in parallel for load testing
purposes.

Here's an example test script that runs against a JSON-based API:

```javascript
    // Tests that a simple, JSON-based API returns the proper results
    var inq = require("inquisitor.js");
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
```

If the file is called json_api.js, here's how to run a test:

    $ inquisitor test json_api.js 
    .
    JsonTest
    ✔ echo

    1 passed, 0 failed.

This indicates that `JsonTest` was run once, and that it passed.

Or you can run a load test using the same script:

    $ inquisitor load --count 10 --runs 10 json_api.js 
    ....................................................................................................
    JsonTest
    ✔ echo [100/100]

    1 passed, 0 failed.

This indicates that `JsonTest` was run 100 times, and that it passed.

What's going on here? Each inquisitor script exports a test, which then can
have one or more testcases. Each testcase is composed of one or more callbacks
to execute, which are run one at a time in an express-like manner.

This particular test is called `JsonTest`. It has a single testcase called
`echo`. When `echo` is run, it will make a request to
`http://echo.jsontest.com/key/value/one/two`. When a response comes back, it
will verify that the response is JSON, that the response code is 200, and that
the JSON body matches `{ one: "two", key: "value" }`. It does this by
extensively leveraging inquisitor's built-in middleware, but you can write
your own easily if the built-in stuff doesn't suit your needs.

## Tests

Tests are straight-forward. They have names and one or more testcases. Every
script run by inquisitor must export a test instance. You should use tests to
cover an aspect of your API - e.g. login.

## Testcases

Testcases have a name and one or more middleware functions to call. They
should cover an individual aspect of whatever your test covers - e.g. if your
test is covering login, one testcase may check what happens for a valid login;
another might check the results of a bad username.

## Middleware

Within a testcase, each middleware is executed in order. Middleware typically
either do assertive checks, or augment `this` to add utility
methods/properties that middleware further in the chain can use.

Here's an example middleware that checks the response code and body:

```javascript
    function() {
        this.equal(this.response.statusCode, 200);
        this.equal(this.responseBody, "Hello, world!");
        this.next();
    }
```

All methods in [assert](http://nodejs.org/api/assert.html) are available on
`this`. There's also `this.next()`, which similarly to express' `next()`, will
execute the next piece of middleware.

There's a few middlewares built into inquisitor:

* `inquisitor.requestor` - Will add a method `this.request` that makes an
  HTTP request, and binds `responseError`, `response`, and `responseBody`
  to `this` when a response comes back. This uses the
  [request](https://github.com/request/request) package in the background.
  Testcases come with this middleware included by default, unless you
  directly instantiate the `inquisitor.TestCase` class.
* `inquisitor.makeRequest(uri, options)` - Returns a middleware that will
  make a call to the given uri with the given request options. Use this
  if the request you're making is fixed.
* `inquisitor.expectJson` - Ensures that the response is valid JSON.
* `inquisitor.matchCode(code)` - Returns a middleware that ensures the
  response code matches the given value.
* `inquisitor.matchJson(json)` - Returns a middleware that ensures the
  response JSON body matches the given value. This should be added after
  `inquisitor.expectJson`, and used when the expected response JSON is
  fixed.

This setup is inspired by express, and allows for seamless composability.

Why do it this way? Our previous project for running integration tests proved
too brittle - either we made high-level abstractions that worked for a narrow
range of APIs, or we made low-level abstractions that proved unwieldy as the
number of tests rose.

This is why inquisitor is optimized for composability - you can mix and match
the middleware (both provided by inquisitor and ones that you write yourself)
to create a correct and terse framework for testing your API.
