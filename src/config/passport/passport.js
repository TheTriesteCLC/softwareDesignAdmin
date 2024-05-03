var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs'); 
var Account;

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        console.log("Serializing");

        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        console.log("Deseriaize User");
        // console.log(user);
        done(null, user);
    });

    // passport.deserializeUser(function(username, done) {
    //     Account.findByUsername(username).then(function(user) {
    //       console.log('deserializing user:',user);
    //       done(null, user); 
    //     }).catch(function(err) {
    //       if (err) {
    //         throw err;
    //       }
    //     });
    // });

    passport.use('local-login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // pass the request to the callback
    }, async (req, username, password, done) => { // email and password from form

        // if (req.headers.referer.includes('customer')){
        //     console.log('This is a customer');
        //     Account = require('../../models/Customer');
        // } else {
        //     console.log('This is an driver');
        //     Account = require('../../models/Driver');
        // }
        console.log('This is an admin login');
        Account = require('../../models/Admin');

        var account = await Account.findOne({ 'username' :  username });
        
        if (!account) { // not exists
            console.log('not exists');
            return done(null, false); 
        }

        var checkPass = await account.comparePassword(password);

        if (!checkPass) {// wrong password
            console.log('Wrong passed');
            return done(null, false); 
        } 

        console.log('success');
        return done(null, account);
    }));

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // pass the request to the callback
    }, async (req, username, password, done) => {
        var newUser;
        // console.log(req);
        

        // if (req.headers.referer.includes('customer')){
        //     console.log('This is a customer');
        //     Account = require('../../models/Customer');
            
        //     // set the user's local credentials
        //     newUser = new Account(req.body);            
        //     newUser.slug = 'customer-' + username;
        //     newUser.status = 'Active';
        // } else {
        //     console.log('This is a driver');
        //     Account = require('../../models/Driver');
            
        //     newUser = new Account(req.body);
        //     newUser.slug = 'driver-' + username;
        //     newUser.status = 'Active';
        // }

        console.log('This is a admin signup');
        Account = require('../../models/Admin');
        
        // set the user's local credentials
        newUser = new Account(req.body);            
        newUser.slug = 'admin-' + username;
        newUser.status = 'Active';

        newUser.username = username;
        const hashedPassword = await bcrypt.hash(password, 7);
        newUser.password = hashedPassword;

        var account = await Account.findOne({ 'username' :  username });

        if (account) { // already existed
            // return done(null, user);
            console.log('Existed');
            return done(null, false);
        } 
        // return done(null, false);

        // save the user
        newUser.save();

        // User.create({username: username, password: password});
        console.log('created');
        return done(null, newUser);
    }));
}