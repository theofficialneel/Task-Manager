var express = require('express');
var User = require('../models/users');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
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


passport.use(new LocalStrategy(
	function (username, password, done) {
		User.getUserByUsername(username, function (err, user) {
			if (err) throw err;
			if (!user) {
				return done(null, false, { message: 'Unknown User' });
			}

			User.comparePassword(password, user.password, function (err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Invalid password' });
				}
			});
		});
	}));

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.getUserById(id, function (err, user) {
		done(err, user);
	});
});

router.post('/login',
  passport.authenticate('local',{ successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/tasks');
  });

router.get('/logout', function (req, res) {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
});

router.patch('/change/username', (req, res, next) => {
    const id = req.user.id;
    const updateOps = {};

    updateOps.username = req.body.username1;

    User
    .updateOne({_id: id}, {$set: updateOps})
    .exec()
    .then(result => {
        res.status(200).json({
            message: "Username updated",
            request: {
                type: 'PATCH',
                url: req.protocol + '://' + req.get('host') + '/users/change/username/'
            }
        });
    })
    .catch(err => {
        res.status(500).json({
            message: err
        });
    });
});

router.patch('/change/password', (req, res, next) => {
    if (req.body.password != req.body.password2) {
		res.render('error');
	} else {
		User.changePassword(req.body.password, function (err,hash) {
			if (err) throw err;
			User
    		.updateOne({_id: req.user.id}, {$set: {password: hash}})
    		.exec()
		    .then(result => {
		        res.status(200).json({
		            message: "Password updated",
		            request: {
		                type: 'PATCH',
		                url: req.protocol + '://' + req.get('host') + '/users/change/password/'
		            }
		        });
		    })
		    .catch(err => {
		        res.status(500).json({
		            message: err
		        });
		    });
		});
	}
});

module.exports = router;