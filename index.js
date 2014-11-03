'use strict';

var express = require('express'),
	bodyParser = require('body-parser'),
	cors = require('cors'),
	port = 8080,
	mongoose = require('mongoose'),
	passport = require('passport'),
	LocalStrategy = require('passport-local'),
	Schema = mongoose.Schema,
	session = require('express-session'),
	request = require('request');
	

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},
function(email,  done) {
  User.findOne({email: email}, function(err, user) {
    if (err) {
      return done(new Error("No user found with those credentials"));
    }
    return done(null, user);
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  })
});

var User = mongoose.model('User', new Schema({
  email: { type: String },
  password: { type: String }
}));

//mongoose setup
mongoose.connect('mongodb://localhost/FireVue');
// var databaseRefrence = 'mongodb://localhost/fireVue';
var connection = mongoose.connection;
//express setup
var app = express();
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(cors());
app.use(session({secret: 'somethingreallyawesome$$$'}));
app.use(passport.initialize());
app.use(passport.session());

var authenticateUser = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (!user) {
      return res.status(401).end();
    }
    req.logIn(user, function(err) {
      return res.send('successfully signed in')
    });
  })(req, res, next);
}

//login API endpoint
app.post('/api/auth', authenticateUser);

// app.post('/hirevueLogin/logout', function(req, res) {
//   req.logout();
//   return res.status(200).end();
// });

//LOGIN
app.post('/hirevueLogin', function(req, res) {
	
	var request = require('request');
	request.post({
		url: 'https://app.devhv.com/api/v1/login/',
		body: {
		    "applicationToken": "test_public_token",
		    "version": "1.2.0",
		    "impersonate": req.body.email,
		    "apiKey": ""
		},
		json: true
	}, 
	function (error, response, body) {
	 	if (!error && response.statusCode == 200) {
	    	return res.json(body);
	 	}
	 	console.log("error", response.statusCode);
	 	return {error: error};
	});
});

app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	next();
});

app.get('/interviews', function(req, res) {
	
	var request = require('request');
	request.get({
		url: 'https://app.devhv.com/api/v1/interviews/',
		json: true
	}, 
	function (error, response, body) {
	 	if (!error && response.statusCode == 200) {
	    	return res.json(body);
	 	}
	 	console.log("error", response.statusCode);
	 	return {error: error};
	});
});

//LOGOUT
app.post('/hirevueLogout', function(req, res) {
	
	var request = require('request');
	request.post({
		url: 'https://app.devhv.com/api/v1/logout/',
		json: true
	}, 
	function (error, response, body) {
		console.log(response.statusCode);
	 	if (!error && response.statusCode == 200) {
	    	return res.json(body);
	 	}
	 	console.log("error", response.statusCode);
	 	return {error: error};
	});
});

var requireAuth = function(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).end();
  }
  next();
};

// mongoose.connect(databaseRefrence);
connection.once('open', function(){
	app.listen(port, function(){
		console.log('Connection Success on mongoDB & http://localhost: ' + port)
	});	
});