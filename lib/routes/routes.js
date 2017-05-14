/**
 * http://usejsdoc.org/
 */
var mongoose = require('mongoose');
var categories = require('../Models/Categories');
var Posts = require('../Models/Posts');
var types = require('../Models/Types');
var mongoosePaginate = require('mongoose-paginate');
const Multi = require('../utils/multi-rest');

const routes = {};

routes.listPost = function (req, res, next) {
    //assert.arrayOfString(req.todos, 'req.todos');
	
	mongoose.connect('mongodb://127.0.0.1/fgd');
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', function(){
		  console.log("Connected to DB");
		 
			
		  Posts.find({}, function(err, data)
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
	//res.send({success: true, files: req.files, message: "file uploaded :)"+JSON.stringify(req.body.jdoc)});
	//console.log("Accept Json"+req.body);
	mongoose.connect('mongodb://127.0.0.1/fgd');
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', function(){
		  console.log("Connected to DB");
		  var npost = new Posts(JSON.parse(req.body.jdoc));
		  console.log(req.files.ss.path);
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
uploadDir: "C:/Users/ehawk/workspace/fungram/upload/", 
filename: 'random', 
filefields: ['video'], 
extensions: ['mp4'],
//thumbnail: {type: 'video'}, 
used: 'maybe'});

routes.comment = function (req, res, next) {
	mongoose.connect('mongodb://127.0.0.1/fgd');
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'MongoDB connection error:'));
	db.once('open', function(){
		  console.log("Connected to DB");
		  var npost = new Posts();
		  npost.update({_id: req.params.id},{ $set: { title: 'jason borne' }},function (err, createdPostObj) {  
			  db.close(); 
			    if (err) {
			        res.send(err);
			    }
			    else
			    {
			    	npost.save();
			    	res.send("Update done : "+req.params.id+" - "+JSON.stringify(createdPostObj));
			    }
			});
			   
		});

	next();
}

module.exports = routes;
