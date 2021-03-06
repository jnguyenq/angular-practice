var express = require('express');
var app = express();
var router = express.Router();
var knex = require('../models/database').knex;
var crypto = require('crypto');
var encryptionRepo = require('../methods/encryption-repo.js');
var cookieParser = require('cookie-parser');

var home = require('../controllers/home.js');
var login = require('../controllers/login.js');
var signup = require('../controllers/signup.js');


router.get('/', function(req, res, next) {
	home(req, res);
});

router.get('/home', function(req, res, next) {
	home(req, res);
});

router.get('/login', function(req, res, next) {
	login(req, res);
});

router.get('/signup', function(req, res, next) {
	signup(req, res);
});


//API's
router.get('/api/users/', function(req, res) {
	knex.select().table('users').then(function(result) {
		res.send(result);
	});
});

router.get('/api/users/:id', function(req, res) {
	knex('users').where('id', req.params.id).then(function(result) {
		res.send(result);
	});
});

router.post('/api/users/', function(req, res) {
	
	knex('users').insert({
		first_name: req.body.first_name, 
		last_name: req.body.last_name,
		email: req.body.email,
		password: req.body.password
	}).then(function(success, fail) {
		if(success) {
			console.log('success');
			res.sendStatus(200);
		} else {
			console.log('fail');
			res.sendStatus(400);
		}
	});
});

router.post('/api/signup/', function(req, res) {
	console.log('signup api hit');
	var salt = crypto.randomBytes(64).toString('hex'); //create salt
	var passhash = crypto.pbkdf2Sync(req.body.password, salt, 10000, 128, 'sha512');//hash pw

	knex('friends').insert({
		first_name: req.body.first_name, 
		last_name: req.body.last_name,
		email: req.body.email,
		password: passhash.toString('hex'),
		salt: salt
	}).then(function(success, fail) {
		if(success) {
			console.log('success');
			res.sendStatus(200);
		} else {
			console.log('fail');
			res.sendStatus(400);
		}
	});

});

router.post('/api/login/', function(req, res) {
	console.log('login api hit');

	//look for matching email
	knex('friends')
		.where('email', req.body.email)
		.then(function(data) {
			if(data.length > 0) {
				var salt = data[0].salt; //salt pw from db
				var encryptedPassword = (crypto.pbkdf2Sync(req.body.password, salt, 10000, 128, 'sha512')).toString('hex');  //encrypt pw from client
				if(encryptedPassword === data[0].password) { //check if match
					console.log('same pw');
					var session_key = crypto.randomBytes(64).toString('hex'); //create session key
					res.cookie('sid', session_key)
					   .send('Logged in successfully');

					knex('friends') //store session_id
						.where('email', req.body.email)
						.update({
							session_id: session_key
						}).then(function() {
							console.log('yay')
						});
				} else {
					console.log('different pw');
					res.send('wrong authentication man');
				}
			} else {
				console.log('wrong authentication');
				res.send('wrong authentication!!');
			}	
		});
});


module.exports = router;
