var LocalStrategy   = require('passport-local').Strategy;
var utils = require('./utils');

var mongoose = require('mongoose');   
var User = mongoose.model('User');

module.exports = function(passport){

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        console.log('serializing user:', user._id);
        return done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            console.log('deserializing user:',user.username);
            return done(err, user);
        });
    });

    passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) { 

            User.findOne({'username':username}, function(err, user){
                if (err){
                    return done(err);
                }
                if (!user){
                    console.log('User Not Found with username '+username);
                    return done(null, false);                 
                }
                if (!utils.isValidPassword(user, password)){
                    console.log('Invalid Password');
                    return done(null, false);
                }
                return done(null, user);
            });
        }
    ));

    passport.use('signup', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {

            User.findOne({ 'username' :  username }, function(err, user) {
                // In case of any error, return using the done method
                if (err){
                    console.log('Error in SignUp: '+err);
                    return done(err);
                }
                // already exists
                if (user) {
                    console.log('User already exists with username: '+username);
                    return done(null, false);
                } else {
                    // if there is no user, create the user
                    var newUser = new User();
                    newUser.username = username;
                    newUser.password = utils.createHash(password);

                    // save the user
                    newUser.save(function(err) {
                        if (err){
                            console.log('Error in Saving user: '+err);  
                            throw err;  
                        }
                        console.log(newUser.username + ' Registration successful');    
                        return done(null, newUser);
                    });
                }
            });

        })
    );
};