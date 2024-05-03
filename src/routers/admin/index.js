const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../../config/passport/passport')(passport);

const siteController = require('../../controllers/admin.c');

router.post('/update-profile', isLoggedIn, siteController.updateProfileUpdated);
router.get('/update-profile', isLoggedIn, siteController.updateProfile);
router.get('/profile', isLoggedIn, siteController.profile);
router.get('/home', isLoggedIn, siteController.home);


router.get('/logout', isLoggedIn, siteController.logout);

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
router.get('/signup', isLoggedIn, siteController.signup);
router.post('/signup',
    passport.authenticate('local-signup', { failureRedirect: './signup?status=failed' }),
    function (req, res) {
        console.log("redirecting");
        console.log(req.user);
        res.redirect('./home');
    }
);

router.get('/', isLoggedIn ,siteController.home);

router.get(/.*/, isLoggedIn, siteController.home)

function isLoggedIn(req, res, next) {

    console.log("Authenticate checking");
    if (req.isAuthenticated()) { // is authenticated
        return next();
    }

    // is not authenticated
    res.redirect('/login');
}

module.exports = router;