var User = require('../models/userSchema');
var Message = require('../models/messageSchema');

var express = require('express');

var api = express.Router();
var mongoose = require('mongoose');

var config = require('../../config');
var secretKey = config.secretKey;

var jsonwebtoken = require('jsonwebtoken');

function createToken(user) {
	var token = jsonwebtoken.sign({
		id: user._id
	}, secretKey, {
		expiresIn: 1440
	});

	return token;
}

api.createUser = function(req, res) {
	var user = new User({
		username: req.body.username,
		password: req.body.password,
		firstname: req.body.firstname,
		lastname: req.body.lastname
	});
	user.save(function(err) {
		if (err) {
			res.status(500).send(err);
			return;
		} else {
			res.status(200).json({
				success: true,
				message: 'User has been created'
			});
		}
	});
};

api.login = function(req, res) {
	User.findOne({
		username: req.body.username
	}).select('password').exec(function(err, user) {
		if (err) {
			res.status(500).send(err);
		} else if (!user) {
			res.status(404).send({
				message: "User doesn't exist"
			});
		} else {

			var validPassword = user.comparePassword(req.body.password);
			if (!validPassword) {
				res.status(406).send({
					message: 'Invalid Password'
				});
			} else {
				///token
				var token = createToken(user);

				res.status(200).json({
					success: true,
					message: "Successfully Logged in",
					token: token,
					userId: user._id
				});
			}
		}
	});
};

api.sendMessage = function(req, res) {
	User.findOne({
		_id: req.decoded.id
	}, function(err, user) {
		if (err) {
			res.status(500).send(err);
		} else if (!user) {
			res.status(404).send({
				message: "User doesn't exist1"
			});
		} else {
			user.blockedBy.forEach(function(id) {
				if (id == req.body.toUser) {
					res.status(406).send({
						message: 'You are blocked by that user'
					});
				} else {
					var message = new Message({
						sentBy: req.decoded.id,
						subject: req.body.subject,
						content: req.body.content,
						sentTo: req.body.toUser
					});

					message.save(function(err, data) {
						if (err) {
							res.status(500).send(err);
							return;
						} else {
							res.status(200).json({
								success: true,
								message: "Message sent succesfully !"
							});

							User.findOne({
								_id: req.body.toUser
							}, function(err, user) {
								if (err) {
									res.status(500).send(err);
								} else if (!user) {
									res.status(404).send({
										message: "User doesn't exist"
									});
								} else {
									user.messages.push(data._id);

									user.save(function(err) {
										if (err) {
											res.status(500).send(err);
										}
									});
								}
							});
						}
					});
				}
			});
		}
	});
};

api.getMessages = function(req, res) {
	User.findOne({
		_id: req.decoded.id
	}).populate('messages').exec(function(err, user) {
		if (err) {
			res.status(500).send(err);
			return;
		} else if (!user) {
			res.status(404).send({
				message: "User doesn't exist"
			});
			return;
		} else {
			res.status(200).json({
				success: true,
				data: user.messages
			});
		}
	});
};

api.blockUser = function(req, res) {
	var username = req.params.username;
	User.findOne({
		username: username
	}, function(err, user) {
		if (err) {
			res.status(500).send(err);
		} else if (!user) {
			res.status(404).send({
				message: "User doesn't exist"
			});
		} else {
			user.blockedBy.push(req.decoded.id);
			user.save(function(err) {
				if (err) {
					res.status(500).send(err);
				} else {
					res.status(200).send({
						message: 'User blocked Successfully !'
					});
				}
			});
		}
	});
};

module.exports = api;
