#!/usr/bin/env node
try {
	var puppeteer = require("puppeteer"); // eslint-disable-line no-var
} catch(err) {
	abort("error: Puppeteer not found");
}

let URI = process.argv[2] || abort("error: URI not specified");
let COVERAGE = process.argv.length >= 3 ? process.argv[3] === "cov" : false;
let TIMEOUT = process.env.QUNIT_TIMEOUT || 2000;

if(COVERAGE) {
	try {
		var pti = require("puppeteer-to-istanbul"); // eslint-disable-line no-var
	} catch(err) {
		abort("error: Puppeteer-to-istanbul not found");
	}
}

run(URI, TIMEOUT, COVERAGE);

async function run(uri, timeout, coverage) {
	uri = normalize(uri);
	console.error("loading test suite at", uri);

	if(uri.startsWith("file://")) {
		let args = ["--allow-file-access-from-files"];
		var options = { args }; // eslint-disable-line no-var
	}
	let browser = await puppeteer.launch(options);

	let page = await browser.newPage();
	page.setDefaultNavigationTimeout(timeout);
	page.on("console", onConsole);

	// hook into QUnit to report results
	let success;
	await page.exposeFunction("QUNIT_REPORT", ({ total, failed, passed, runtime }) => {
		success = failed === 0;
		report(success, { total, failed, passed, runtime });
	});
	await page.evaluateOnNewDocument(hijackQUnit);

	// abort on timeout
	let timer = setTimeout(() => {
		console.error("timeout - aborting");
		terminate(browser, 1);
	}, timeout);

	await startCoverage(page, coverage);
	// run test suite
	try {
		await page.goto(uri, { waitUntil: "networkidle0" });
	} catch(err) {
		abort(`${err}`);
	}
	clearTimeout(timer);
	await stopCoverage(page, coverage);
	terminate(browser, success ? 0 : 1);
}

async function startCoverage(page, coverage) {
	if(!coverage) {
		return;
	}
	await page.coverage.startJSCoverage();
}

async function stopCoverage(page, coverage) {
	if(!coverage) {
		return;
	}
	const jsCoverage = await page.coverage.stopJSCoverage();
	pti.write(jsCoverage, {
		includeHostname: false, storagePath: "./.nyc_output"
	});
}

function report(success, { total, failed, passed, runtime }) {
	let prefix = success ? `✓ passed ${passed}` : `✗ failed ${failed}`;
	console.error(`${prefix} / ${total} (${runtime} ms)`);
}

function hijackQUnit(report) {
	let _QUNIT;
	Object.defineProperty(window, "QUnit", {
		get: () => _QUNIT,
		set: value => {
			_QUNIT = value;
			_QUNIT.done(details => {
				QUNIT_REPORT(details); // eslint-disable-line no-undef
			});
		}
	});
}

function onConsole(msg) {
	let type = msg.type();
	let prefix = type === "log" ? "" : `[${type}] `;
	console.log(prefix + msg.text()); // eslint-disable-line no-console
}

function terminate(browser, status = 0) {
	browser.close();
	process.exit(status);
}

function abort(message, status = 1) {
	console.error(message);
	process.exit(status);
}

function normalize(uri) {
	if(/^\.?\.\//.test(uri)) { // relative, i.e. starts with `./` or `../`
		let path = require("path");
		uri = path.resolve(process.cwd(), uri);
	}

	if(uri.startsWith("/")) {
		return `file://${uri}`;
	}

	return uri;
}
