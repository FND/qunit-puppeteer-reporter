qunit-puppeteer-reporter
========================

headless browser testing for [QUnit](https://qunitjs.com) test suites, using
[Puppeteer](https://pptr.dev) to report results via the command line

    $ qunit-puppeteer-reporter http://localhost:8000/test/
    loading test suite at http://localhost:8000/test/
    ✓ passed 18 / 18 (106 ms)

Note that this intentionally focuses only on reporting success/failure; for
details and debugging you'll want to open the test suite in a regular browser.


Getting Started
---------------

    $ npm install qunit-puppeteer-reporter
    $ npm install -g puppeteer

Due to its size, the Puppeteer package is expected to be installed separately so
it can be used across multiple projects.

    $ npx qunit-puppeteer-reporter /path/to/tests.html

Both local file paths and URLs are supported.

(Note that `npx` is merely a
[shortcut](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b)
for commands in `node_modules/.bin` - you might also define
[npm scripts](https://docs.npmjs.com/misc/scripts) to use `npm start`, for
example.)


Contributing
------------

* ensure [Node](http://nodejs.org) is installed
* `npm install` downloads dependencies
* `npm test` checks code for stylistic consistency


Alternatives
------------

* [qunit-puppeteer](https://github.com/davidtaylorhq/qunit-puppeteer)
* [node-qunit-puppeteer](https://github.com/ameshkov/node-qunit-puppeteer)
