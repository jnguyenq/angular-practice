'use strict';
var fs = require('fs');
var express = require('express');
var router = express.Router();
var app = express();
var cookieParser = require('cookie-parser');
var knex = require('../models/database').knex;

module.exports = function (req, res) {
	
	var rawCookie = req.headers.cookie;

	if(rawCookie) {
		var processedCookie = rawCookie.split("=");
		var cookie = processedCookie[1];
		var sessionIdArray = [];
		knex.select('session_id')
			.from('friends')
			.then(function(data) {
				data.forEach(function(item) {
					sessionIdArray.push(item.session_id);
				})
				if((sessionIdArray).indexOf(cookie) > -1) {
					console.log('exists');
					res.render('home.html')
				} else {
					res.redirect('/login');
				}
			});
	} else {
		res.redirect('/login');
	}

};