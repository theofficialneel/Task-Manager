var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', ensureAuth, function(req, res, next) {
  res.render('index', { User: req.user });
});

function ensureAuth(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/users/login');
	}
}

module.exports = router;
