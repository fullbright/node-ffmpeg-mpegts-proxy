/**
 * Returns the avconv options needed for the specified source
 * @param {type} source
 * @returns array the options array
 */
var getAvconvOptions = function(source) {
	var options = getInputAvconvOptions(source);
	return options.concat(getOutputAvconvOptions(source));
};

/**
 * Returns the input options (including -i)
 * @param {type} source
 * @returns array
 */
var getInputAvconvOptions = function(source) {
	var options = [
		'-re'
	];

	if (source.avconvOptions !== undefined && source.avconvOptions.input !== undefined)
		options = options.concat(source.avconvOptions.input);

	if (source.avconvOptions !== undefined && source.avconvOptions.debug !== undefined)
		options = options.concat([
			'-v', 
			source.avconvOptions.debug
		]);
	
	if (source.avconvOptions !== undefined && source.avconvOptions.useragent !== undefined)
		options = options.concat([
			'-user-agent', 
			source.avconvOptions.useragent
		]);

	if (source.avconvOptions !== undefined && source.avconvOptions.cookie !== undefined)
	{
		var FileCookieStore = require('tough-cookie-filestore');
		var j = request.jar(new FileCookieStore('../cookies.json'));
		options = options.concat([
			'-headers', 
			source.avconvOptions.cookie
		]);
	}

	
	return options.concat([
		'-i',
		source.source
	]);
};

/**
 * Returns the output options
 * @param {type} source
 * @returns {options}
 */
var getOutputAvconvOptions = function(source) {
	var options = [
		'-vcodec', 'copy',
		'-acodec', 'copy',
		'-metadata', 'service_provider=' + source.provider,
		'-metadata', 'service_name=' + source.name,
		'-f', 'mpegts'
	];

	if (source.avconvOptions !== undefined && source.avconvOptions.output !== undefined)
		options = options.concat(source.avconvOptions.output);

	return options.concat(['pipe:1']);
};

var exports = module.exports = {};
exports.getAvconvOptions = getAvconvOptions;
