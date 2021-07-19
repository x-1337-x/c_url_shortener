const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const url = new Schema({
	url: {
		type: String,
		require: true,
	},
	alias: {
		type: String,
		require: true,
	},
	date: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('url', url);
