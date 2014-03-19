// Filesystem and Restler http library.
var fs = require('fs');
var rest = require('restler');

// Initialize the uploader class.
exports.init = function (grunt, options) {

    // Method to get the API endpoint.
    var api_endpoint = 'http://' + options.username + ':' + options.password + '@api.lvh.me:3000/1/pages/' + options.page_id + '/theme';

	// Upload the theme to the API.
	exports.upload = function (archive_path, callback) {
	  // Get file size (necessary for multipart upload)
	  fs.stat(archive_path, function(err, stats) {
	    // See if stating the file have any erros.
	    if (err) {
	      // Fail gracefully with the error.
	      grunt.fail.warn('Error: ' + err);

	    // If no error occurs and it confirms the file exists.
	    } else if (stats.isFile()) {
	      // HTTP request
	      rest.request(api_endpoint, {
	        // Stadard multipart HTTP POST to the api.
	        method: 'PUT',
	        multipart: true,
	        parser: rest.parsers.json,
	        data: {
	          // Attach the zipfile we've just created.
	          zip: rest.file(archive_path, null, stats.size, null, 'application/zip')
	        }

			// Callback once the upload is complete.
			}).on('success', function(data, response) {
				// Upload was succesfull.
				// Log that things were a success.
				grunt.log.ok('Theme successfully deployed to "' + options.page_id + '"');

			}).on('422', function(data, response) {
				// Append all of the validation messages to grunt errors.
				// Loop over the error messages collection.
				grunt.util._.each(data.messages, function(value, key) {
					// Loop over the messages for each key.
					grunt.util._.each(value, function(message) {
						// Log the error message with grunt.
						grunt.log.warn(message);
					});
				});

				// The upload was not a success.
				// Fail gracefully with some error information.
				grunt.fail.fatal('The uploaded theme did not appear to be valid.');

			}).on('401', function(data, repsonse) {
				// The upload was not a success due to authentication errors.
				grunt.fail.fatal('Wrong username and password, please check and try again.');

			}).on('complete', function(data, response) {
				// The upload attempt for better or works is now complete.
		        // Run the callback method.
		        callback();
			});
	    }
	  });
	};

	// Return the classes exports.
	return exports;

};