/**
 * http://usejsdoc.org/
 */
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var postSchema = new Schema({
    _id				:	ObjectId,
    title			:	String,
    by				:	String,
    onCreate		:	String,
    onEdit			:	String,
    hostIp			:	String,
    tags			:	[String],
    postCategory	:	String,
    resource		:	String,
    type			:	String,
    hearts			:	[{by:String, hostIp:String, onCreate:String}],
    dishearts		:	[{by:String, hostIp:String, onCreate:String}],
    reviewer		:	{by:String,  hostIp:String, onCreate:String},
    offence			:	[{by:String, hostIp:String, onCreate:String, text:String}],
    comments		:	[{by:String, hostIp:String, onCreate:String, text:String}],
    isVisible		:	Boolean
     
});

var Posts = mongoose.model('posts', postSchema ,'posts');

module.exports = Posts;