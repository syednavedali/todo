/**
 * http://usejsdoc.org/
 */
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var heartSchema = new Schema({by:String, hostIp:String, onCreate:String});
var disHeartSchema = new Schema({by:String, hostIp:String, onCreate:String});
var reviewerSchema = new Schema({by:String,  hostIp:String, onCreate:String});
var offenceSchema = new Schema({by:String, hostIp:String, onCreate:String, text:String});
var commentsSchema = new Schema({by:String, hostIp:String, onCreate:String, text:String});

var postSchema = new Schema({
   // _id				:	ObjectId,
    title			:	{type: String, required: true},
    by				:	{type: String, required: true},
    onCreate		:	{type: Date, default: Date.now},
    onEdit			:	{type: Date},
    hostIp			:	{type: String, required: true},
    tags			:	[{type: String, required: true}],
    postCategory	:	{type: String, required: true},
    resource		:	{type: String, required: true},
    type			:	{type: String, required: true},
    hearts			:	[heartSchema],
    dishearts		:	[disHeartSchema],
    reviewer		:	reviewerSchema,
    offence			:	[offenceSchema],
    comments		:	[commentsSchema],
    isVisible		:	{type: Boolean, default: false}
});

/*var postSchema = new Schema({
    _id				:	ObjectId,
    title			:	String,
    by				:	String,
    onCreate		:	Date, 
    onEdit			:	Date,
    hostIp			:	String,
    tags			:	[String],
    postCategory	:	String,
    resource		:	String,
    type			:	String,
    hearts			:	[heartSchema],
    dishearts		:	[disHeartSchema],
    reviewer		:	reviewerSchema,
    offence			:	[offenceSchema],
    comments		:	[commentsSchema],
    isVisible		:	Boolean
});*/

var Posts = mongoose.model('posts', postSchema ,'posts');

module.exports = Posts;