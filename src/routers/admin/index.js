const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../../config/passport/passport')(passport);

const siteController = require('../../controllers/admin.c');

//Login
router.get('/login', siteController.login);
router.post('/login',
    passport.authenticate('local-login', { failureRedirect: './login?status=failed' }),
    function (req, res) {
        console.log("redirecting");
        console.log(req.user);
        res.redirect('./home');
    }
);

//Signup new customer
// router.post('/signup/available', siteController.avalable);
router.get('/signup', siteController.signup);
router.post('/signup',
    passport.authenticate('local-signup', { failureRedirect: './signup?status=failed' }),
    function (req, res) {
        console.log("redirecting");
        console.log(req.user);
        res.redirect('./home');
    }
);

function isLoggedIn(req, res, next) {

    console.log("Authenticate checking");
    if (req.isAuthenticated()) { // is authenticated
        return next();
    }

    // is not authenticated
    res.redirect('/customer/login');
}

module.exports = router;