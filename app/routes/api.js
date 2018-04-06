var express = require('express');

var user = require('./user');

var config = require('../../config');
var secretKey = config.secretKey;

var jsonwebtoken = require('jsonwebtoken');

var api = express.Router();

api.post('/createUser', user.createUser);

api.post('/login', user.login);

/*api.use(function(req, res, next) {

	console.log("in the middleware");
	var token = req.body.token || req.headers.authorization;

	//check if token exists
	if (token) {
		jsonwebtoken.verify(token, secretKey, function(err, decoded) {
			if (err) {
				res.status(403).send({
					success: false,
					message: 'Failed to authenticate User'
				});
			} else {
				req.decoded = decoded;
				next();
			}
		});
	} else {
		res.status(403).send({
			success: false,
			message: 'No token provided'
		});
	}
});*/


module.exports = api;
