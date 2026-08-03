/* global beforeEach, describe, it */

"use strict";

var should = require("should");
var needle = require("needle");
var requestedUrl;
var getCallCount;

needle.get = function(url, options, callback) {
    requestedUrl = url;
    getCallCount += 1;
    callback(null, {
        statusCode: 200
    }, "");
};

var ResearchHandler = require("../../app/routes/research");

describe("ResearchHandler", function() {
    beforeEach(function() {
        requestedUrl = null;
        getCallCount = 0;
    });

    it("uses the fixed research URL when a client supplies a URL", function() {
        var handler = new ResearchHandler({});
        var req = {
            query: {
                symbol: "AAPL",
                url: "http://169.254.169.254/latest/meta-data/"
            }
        };
        var res = {
            writeHead: function() {},
            write: function() {},
            end: function() {}
        };

        handler.displayResearch(req, res);

        requestedUrl.should.startWith("https://finance.yahoo.com/quote/");
        requestedUrl.should.not.containEql("169.254.169.254");
        getCallCount.should.equal(1);
    });

    it("rejects a malicious stock symbol without making a request", function() {
        var handler = new ResearchHandler({});
        var req = {
            query: {
                symbol: "http://169.254.169.254/latest/meta-data/"
            }
        };
        var responseStatus;
        var renderedView;
        var renderedData;
        var res = {
            status: function(status) {
                responseStatus = status;
                return this;
            },
            render: function(view, data) {
                renderedView = view;
                renderedData = data;
            }
        };

        handler.displayResearch(req, res);

        responseStatus.should.equal(400);
        renderedView.should.equal("research");
        renderedData.error.should.be.String();
        getCallCount.should.equal(0);
    });
});
