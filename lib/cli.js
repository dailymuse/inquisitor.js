var path = require("path");
var fs = require("fs");
var runners = require("./runners");
var objects = require("./objects");

// Recurses through a directory, returning a list of file paths. For
// simplicity's sake, this executes synchronously.
function getFiles(paths) {
    var recurse = function(p) {
        var stat = fs.statSync(p);

        if(stat.isDirectory()) {
            var subpaths = [];

            fs.readdirSync(p).forEach(function(file) {
                subpaths = subpaths.concat(recurse(path.join(p, file)));
            });

            return subpaths;
        } else if(stat.isFile()) {
            return [p];
        }
    };

    var allFiles = [];

    paths.forEach(function(p) {
        allFiles = allFiles.concat(recurse(path.resolve(p)));
    });

    return allFiles;
}

// Loads the test modules based on the input CLI arguments
function loadTests(opts) {
    // Require all of the modules. Assumes that all of the modules export test
    // objects.
    var tests = getFiles(opts._.slice(1)).map(require);

    var filter = opts.filter;

    // If a filter option was specified, find only the relevant test(s).
    if(filter) {
        var filterParts = filter.split(".");

        if(filterParts > 0) {
            var testFilter = filterParts[0];

            tests = tests.filter(function(test) {
                return test.name == testFilter;
            });

            if(filterParts.length > 1) {
                var testcaseFilter = filterParts.slice(1).join(".");

                tests = tests.map(function(test) {
                    return new objects.Test(test.name, test.testcases.filter(function(testcase) {
                        return testcase.name == testcaseFilter;
                    }));
                });
            }
        }
    }

    return tests;
}

// Runs a single test pass
function testrunner(opts) {
    var tests = loadTests(opts);
    runners.testrunner(tests);
}

// Runs a load test
function loadrunner(opts) {
    var tests = loadTests(opts);
    var count = opts.count;
    var runs = opts.runs;
    runners.loadrunner(tests, count, runs);
}

module.exports = {
    testrunner: testrunner,
    loadrunner: loadrunner
};
