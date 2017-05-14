"use strict";

const fileExtension = require('file-extension');
const Thumbler = require('thumbler');
const uuid = require('uuid');
const fs = require('fs-extra');
const mime = require('mime');

const f = {};

f.check = function check(file, options, callback) {
	if (typeof(file) === 'undefined')
	{
		// check if the field is mendtory or not
		if (options.used == "maybe") {
			return callback(null, false);
		} else if (options.used == "must") {
			return callback({code: "ExternalError", messege: "Cannot read property of undefined"}, null);
		}
	}else {
		if (options.extensions && !options.extensions.includes(mime.extension(file.type) || file.type.split("/")[1])) {
			return callback({code: "ExternalError", messege: "Please upload file with allowed extensions."}, null);
			
		} else {
			return callback(null, true);	
		}
	}
}

f.thumbnail =function (path, options, callback){
	fs.mkdirpSync(options.uploadDir+'thumbnails/');
	Thumbler({
		type: options.thumbnail.type, 
		input: path,
		output: options.uploadDir+'thumbnails/'+uuid.v4()+'.jpeg', 
		time: options.thumbnail.time || '00:00:01',
		size: options.thumbnail.size, 
	}, function(err, path){
	    if (err) return callback(err, null);
	    return callback(null, path)
	});
}


// renaming the file
f.filename = function (file, options){
	if (options.filename == "random") {
		return uuid.v4() + '.' + (mime.extension(file.type) || file.type.split("/")[1]);
	}else if (options.filename == "same") {
		return file.name.replace(fileExtension(file.name), '') + (mime.extension(file.type) || file.type.split("/")[1]);
	}else if (options.filename == "plus_date") {
		return file.name.replace('.' + fileExtension(file.name), '') + '_' + new Date().toString().replace(/ /g, '_') + '.' + (mime.extension(file.type) || file.type.split("/")[1]);
	} else {
		return uuid.v4() + '.' + (mime.extension(file.type) || file.type.split("/")[1]);
	}
}

// clean the file object from unwanted attributes 
f.restructure = function (file){
	return {
		path: file.path,
		type: file.type, 
		size: file.size,
		name: file.name,
		thumbnail: file.thumbnail || null
	};
}

// clean files from the system 
f.clean = function(files) {
	files.forEach(function(file){
		fs.unlinkSync(file);
	})
}
module.exports = f;