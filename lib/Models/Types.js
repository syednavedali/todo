/**
 * http://usejsdoc.org/
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var typeSchema = new Schema({
    _id		:	ObjectId,
    type	:	String
});

var Types = mongoose.model('types', typeSchema ,'postType');

module.exports = Types;