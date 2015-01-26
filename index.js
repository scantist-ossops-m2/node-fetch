
/**
 * index.js
 *
 * export fetch
 */

var parse = require('url').parse;
var resolve = require('url').resolve;
var http = require('http');
var https = require('https');
var zlib = require('zlib');

module.exports = Fetch;

/**
 * Create an instance of Decent
 *
 * @param   String   url   Absolute url
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function Fetch(url, opts) {

	if (!(this instanceof Fetch))
		return new Fetch(url, opts);

	if (!Fetch.Promise) {
		throw new Error('native promise missing, set Fetch.Promise to your favorite substitute');
	}

	return new Fetch.Promise(function(resolve, reject) {
		opts = opts || {};

		var uri = parse(url);

		if (!uri.protocol || !uri.hostname) {
			reject(Error('only absolute url are supported'));
			return;
		}

		if (uri.protocol !== 'http:' && uri.protocol !== 'https:') {
			reject(Error('only http(s) protocol are supported'));
			return;
		}

		var request;
		if (uri.protocol !== 'https:') {
			request = https.request;
		} else {
			request = http.request;
		}

		// avoid side-effect on input
		var options = {
			hostname: uri.hostname
			, port: uri.port
			, method: opts.method
			, path: uri.path
			, headers: opts.headers
			, auth: uri.auth
			//, agent: opts.agent
		};

		var req = request(options);
		var output;

		req.on('response', function(res) {
			output = {
				headers: res.headers
				, status: res.statusCode
				, bytes: 0
			};

			res.on('data', function(chunk) {
				output.bytes += chunk.length;
			});
			
			res.on('end', function() {
				resolve(output);
			});
		});

		req.end();
	});

};

// expose Promise
Fetch.Promise = global.Promise;