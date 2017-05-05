/**
 * http://usejsdoc.org/
 */
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema,
ObjectId = Schema.ObjectId;

var categorySchema = new Schema({
    _id		:	ObjectId,
    name	:	String
});
categorySchema.plugin(mongoosePaginate);
var Categories = mongoose.model('categories', categorySchema ,'categories');

module.exports = Categories;