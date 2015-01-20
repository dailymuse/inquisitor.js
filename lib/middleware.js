var request = require("request");

function requestMiddleware() {
    this._request = request.defaults(this.requestOptions || {});

    this.request = function(uri, options) {
        this._request(uri, options || {}, function(error, response, body) {
            this.responseError = error;
            this.response = response;
            this.responseBody = body;
            this.next();
        }.bind(this));
    }.bind(this);

    this.next();
}

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

module.exports = {
    request: requestMiddleware,
    expectJson: expectJson
};
