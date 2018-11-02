var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', ensureAuth, function(req, res, next) {
    console.log(req.user);
    res.render('task_list', {auth_user: req.user});
});

function ensureAuth(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        res.redirect('/users/login');
    }
}

module.exports = router;
