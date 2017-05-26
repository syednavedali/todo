/**
 * http://usejsdoc.org/
 */
var mongoose = require('mongoose');
var categories = require('../Models/Categories');
var Posts = require('../Models/Posts');
var types = require('../Models/Types');
var mongoosePaginate = require('mongoose-paginate');
const Multi = require('../utils/multi-rest');
const uuid = require('uuid');

const routes = {};

routes.listPost = function (req, res, next) {
	mongoose.connect('mongodb://127.0.0.1/fgd');
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', function(){
		console.log("Connected to DB");
		mongoose.set('debug', true);
		var criteria = req.params.criteria;

		console.log("---------------- . "+criteria);
		if(criteria==='recent')
		{
			Posts.find({}).sort({ onCreate: -1 }).exec(function(err, data)
					{
				if (err) throw err;

				console.log(data);
				res.writeHead(200, {
					'Content-Type': 'application/json; charset=utf-8'
				});
				//res.send(200, "{Listing Posts}");
				res.end(JSON.stringify(data));
				db.close();
				//db.disconnect();
				next();
					});
		}
		else if(criteria==='mstshared')
		{
			Posts.find({}).sort({ lftmShareDwnld: -1 }).exec(function(err, data)
			{
				if (err) throw err;

				console.log(data);
				res.writeHead(200, {
					'Content-Type': 'application/json; charset=utf-8'
				});
				res.end(JSON.stringify(data));
				db.close();
				next();
			});
		}
		else if(criteria==='mlikedtdy' || criteria==='mlikedlftm')
		{
			var upper = new Date();
			var lower =  new Date();
			var query = '';
			
			if(criteria==='mlikedlftm')
			{
				upper.setHours(23);
				upper.setMinutes(59);
				upper.setSeconds(59);
				upper.setMilliseconds(998);
			
				lower.setHours(0);
				lower.setMinutes(0);
				lower.setSeconds(0);
				lower.setMilliseconds(1);
			
				//console.log("  - - - - "+upper+" ()() - - - - "+lower);
				query = {"onHeart": {"$gte": lower, "$lt":upper }};
			}
			
			Posts.find(query).sort({ tdyHeartCount: -1 }).exec(function(err, data)
			{
				if (err) throw err;

				console.log(data);
				res.writeHead(200, {
					'Content-Type': 'application/json; charset=utf-8'
				});
				//res.send(200, "{Listing Posts}");
				res.end(JSON.stringify(data));
				db.close();
				//db.disconnect();
				next();
			});
		}
	});
}

routes.listTypes = function (req, res, next) {
	//assert.arrayOfString(req.todos, 'req.todos');
	mongoose.connect('mongodb://127.0.0.1/fgd');
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', function(){
		console.log("Connected to DB");


		types.find({}, function(err, data)
				{
			if (err) throw err;

			console.log(data);
			res.writeHead(200, {
				'Content-Type': 'application/json; charset=utf-8'
			});
			res.end(JSON.stringify(data));
			db.close();
			next();
				});

	});
}

routes.listCategories = function (req, res, next) {
	//assert.arrayOfString(req.todos, 'req.todos');
	mongoose.connect('mongodb://127.0.0.1/fgd');
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', function(){
		console.log("Connected to DB");

		// categories.find({}, function(err, data)
		categories.paginate({}, { offset: 2, limit: 1 }, function(err, data)
				{
			if (err) throw err;

			console.log(data);
			res.writeHead(200, {
				'Content-Type': 'application/json; charset=utf-8'
			});
			//res.send(200, "{Listing Posts}");
			res.end(JSON.stringify(data));
			db.close();
			next();
				});
	});
}

routes.createPost = function (req, res, next) {
	//req.log.warn({params: p}, 'createTodo: missing task'); //look at logging mechanism here
	mongoose.connect('mongodb://127.0.0.1/fgd');
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', function(){
		console.log("Connected to DB");
		var npost = new Posts(JSON.parse(req.body.jdoc));
		//npost.pid = npost.by+"---"+uuid.v4();
		npost.hostIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		//todo - create logic on success of file upload save the document to DB else through error
		npost.resource = req.files.ss.path;
		/*var npost = new Posts({
				    "title" : "first post",
				    "by" : "admin",

				    "hostIp" : "127.0.0.1",
				    "tags" : [ 
				        "animal", 
				        "cats", 
				        "zoo"
				    ],
				    "postCategory" : "Kids",
				    "resource" : "/awr/crt/2014/cat.gif",
				    "type" : "GIF",    
				    "isVisible" : "false" 
		  				});*/
		// console.log("-------------------------------nr--------------- "+npost);
		//{"title": "first J post", "by": "admin", "hostIp": "127.0.0.1", "postCategory": "Kids", "type": "GIF", "isVisible": false,"tags": ["animal", "cats", "zoo"]}
		//post.resource = files.ss.path;
		npost.save(function (err, createdPostObj) {  
			db.close(); 
			if (err) {
				res.send(err);
			}
			else
			{
				// This createdTodoObject is the same one we saved, but after Mongo
				// added its additional properties like _id.
				res.send(200);
			}
		});

	});
	//res.send(200);
	next();
}

routes.upload = new Multi({ 
	uploadDir: "C:/Users/snavedal/workspace/TODO/uploads/", 
	filename: 'random', 
	filefields: ['video'], 
	extensions: ['mp4'],
	//thumbnail: {type: 'video'}, 
	used: 'maybe'
});

routes.comment = function (req, res, next) {
	mongoose.connect('mongodb://127.0.0.1/fgd');
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', function(){
		var commentsObj = {
				by : req.body.by,
				hostIp : req.headers['x-forwarded-for'] || req.connection.remoteAddress,
				onCreate : Date.now(),
				text : req.body.comment
		}
		//Posts.update({"_id":req.params.id},{ $set: { title: 'jason HH borne' }},function (err, createdPostObj) {  
		Posts.update({"_id":req.body.postId},{ $push: {comments: commentsObj}},function (err, createdPostObj) {
			db.close(); 
			if (err) {
				res.send(err);
			}
			else 
			{
				res.send("Comment Added");
			}
		});

	});

	next();
}

routes.heart = function (req, res, next) {
	mongoose.connect('mongodb://127.0.0.1/fgd');
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', function(){
		var heartsObj = {
				by : req.body.by,
				hostIp : req.headers['x-forwarded-for'] || req.connection.remoteAddress,
				onCreate : Date.now(),
		}
		//Posts.update({"_id":req.params.id},{ $set: { title: 'jason HH borne' }},function (err, createdPostObj) {  
		// Posts.update({"_id":req.body.postId},{$set{onHeart, tdyHeartCount, lftmHeartCount} $push: {hearts: heartsObj}},function (err, createdPostObj) {
		Posts.findById(req.body.postId, function(err, post)
		{

			var date = new Date(post.onHeart);
			var hrtCntTdy = 0;
			var lftmHrtCnt = 0;

			if(date.getTime()-new Date().getTime() >= 24)
			{
				date = new Date();
			}
			else
			{
				hrtCntTdy = post.tdyHeartCount+1;
				console.log(" Adding 1 - "+hrtCntTdy);
			}
			lftmHrtCnt = post.lftmHeartCount+1;

			Posts.update({"_id":req.body.postId},{$set: {onHeart: date, tdyHeartCount: hrtCntTdy, lftmHeartCount: lftmHrtCnt}, $push: {hearts: heartsObj}},function (err, createdPostObj) {
				// Posts.update({"_id":req.body.postId},{ $push: {hearts: heartsObj}},function (err, createdPostObj) {
				db.close(); 
				if (err) {
					res.send(err);
				}
				else 
				{
					res.send("Heart Added");
				}
			});
		});

	});

	next();
}

routes.disheart = function (req, res, next) {
	mongoose.connect('mongodb://127.0.0.1/fgd');
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', function(){
		var disHeartsObj = {
				by : req.body.by,
				hostIp : req.headers['x-forwarded-for'] || req.connection.remoteAddress,
				onCreate : Date.now(),
		}
		//Posts.update({"_id":req.params.id},{ $set: { title: 'jason HH borne' }},function (err, createdPostObj) {  
		Posts.update({"_id":req.body.postId},{ $push: {dishearts: disHeartsObj}},function (err, createdPostObj) {
			db.close(); 
			if (err) {
				res.send(err);
			}
			else 
			{
				res.send("Dis Heart Added");
			}
		});

	});

	next();
}

routes.cntdownload = function (req, res, next) {
	mongoose.connect('mongodb://127.0.0.1/fgd');
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', function(){
			Posts.update({"_id":req.params.postId},{ $inc: {lftmShareDwnld: 1}},function (err, createdPostObj) {
			db.close(); 
			if (err) {
				res.send(err);
			}
			else 
			{
				res.send("Share & Download Counted");
			}
		});

	});

	next();
}

routes.offence = function (req, res, next) {
	mongoose.connect('mongodb://127.0.0.1/fgd');
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', function(){
		var offenceObj = {
				by : req.body.by,
				hostIp : req.headers['x-forwarded-for'] || req.connection.remoteAddress,
				onCreate : Date.now(),
				text : req.body.offence
		}
		//Posts.update({"_id":req.params.id},{ $set: { title: 'jason HH borne' }},function (err, createdPostObj) {  
		Posts.update({"_id":req.body.postId},{ $push: {offence: offenceObj}},function (err, createdPostObj) {
			db.close(); 
			if (err) {
				res.send(err);
			}
			else 
			{
				res.send("Offence Raised");
			}
		});

	});

	next();
}

routes.review = function (req, res, next) {
	mongoose.connect('mongodb://127.0.0.1/fgd');
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', function(){
		var reviewObj = {
				by : req.body.by,
				hostIp : req.headers['x-forwarded-for'] || req.connection.remoteAddress,
				onCreate : Date.now(),
				text : req.body.review
		}
		//Posts.update({"_id":req.params.id},{ $set: { title: 'jason HH borne' }},function (err, createdPostObj) {  
		Posts.update({"_id":req.body.postId},{ $set: {reviewer: reviewObj, isVisible: req.body.isVisible}},function (err, createdPostObj) {
			db.close(); 
			if (err) {
				res.send(err);
			}
			else 
			{
				res.send("Review Completed");
			}
		});

	});

	next();
}

module.exports = routes;
