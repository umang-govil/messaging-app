var User = require('../models/userSchema');

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
			res.status(400).send(err);
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
		if (err) throw err;

		if (!user) {
			res.send({
				message: "User doesn't exist"
			});
		} else if (user) {

			var validPassword = user.comparePassword(req.body.password);
			if (!validPassword) {
				res.send({
					message: 'Invalid Password'
				});
			} else {
				///token
				var token = createToken(user);

				res.status(200).json({
					success: true,
					message: "Successfully Logged in",
					token: token
				});
			}
		}
	});
};

module.exports = api;
