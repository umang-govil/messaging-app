var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MessageSchema = new Schema({
	sentBy: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	subject: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	sentTo: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	}
}, {
	timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);
