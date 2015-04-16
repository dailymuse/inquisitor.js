var request = require("request");
var url = require("url");

// Middleware for adding a `request` method to the testcase context. This
// allows you to make an http request, and binds the response on `this` when
// it comes back. This should be used for almost all testcases.
function requestor() {
    this._request = request.defaults(this.requestOptions || {});

    this.request = function(uri, options) {
        options = options || {};

        // Add the host parameter, as not having it has caused issues in the
        // wild
        var parsed = url.parse(uri);

        if(parsed.host) {
            if(!("headers" in options)) {
                options["headers"] = {};
            }

            if(!("Host" in options.headers)) {
                options.headers["Host"] = parsed.host;
            }
        }

        this._request(uri, options || {}, function(error, response, body) {
            this.responseError = error;
            this.response = response;
            this.responseBody = body;
            this.next();
        }.bind(this));
    }.bind(this);

    this.next();
}

// Returns a middleware that will make an HTTP request. This should be used
// when the HTTP request that will be made is fixed.
function makeRequest(uri, options) {
    return function() {
        this.request(uri, options);
    }
}

// Parses the response object to ensure it's valid JSON. This should be used
// when you know the response should be JSON, even if it's an error.
function expectJson() {
    if(this.responseError != null) {
        this.ok(false, "Unexpected error: " + this.responseError);
        return this.done();
    }

    var contentType = this.response.headers['content-type'];
    this.ok(contentType.match(/^application\/json(; (.+))?$/), "Invalid content-type: " + contentType);
    
    try {
        this.responseJson = JSON.parse(this.responseBody);
    } catch(e) {
        this.ok(false, "Could not parse response JSON: " + e);
    }

    this.next();
}

// Returns a middleware that ensures the HTTP response has the correct status code.
function matchCode(code) {
    return function() {
        this.equal(this.response.statusCode, code);
        this.next();
    };
}

// Returns a middleware that ensures the JSON body matches what's expected.
// This should be used when the expected JSON response is fixed.
function matchJson(json) {
    return function() {
        this.deepEqual(this.responseJson, json);
        this.next();
    };
}

module.exports = {
    requestor: requestor,
    makeRequest: makeRequest,
    expectJson: expectJson,
    matchCode: matchCode,
    matchJson: matchJson
};
