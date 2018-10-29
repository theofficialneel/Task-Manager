var express = require('express');
var User = require('../models/users');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('Handling users GET requests');
});

//login
router.get('/login', function(req, res, next) {
  res.render('login');
});

//register
router.get('/register', function(req, res, next) {
  res.render('register');
});

router.post('/register', function(req, res, next) {
  	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if (errors) {
		res.render('register', {
			errors: errors
		});
	}
	else {
		var newUser = new User({
						name: name,
						email: email,
						username: username,
						password: password
					});
		User.createUser(newUser, function (err, user) {
			if (err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');
		res.redirect('/users/login');
	}
});
module.exports = router;
