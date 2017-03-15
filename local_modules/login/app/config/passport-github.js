'use strict';

var User           = require('../models/users-github');
var GitHubStrategy = require('passport-github').Strategy;
var configAuth     = require('./auth');

module.exports = function (passport) {

	passport.use(new GitHubStrategy(
	    {
    		clientID    : configAuth.githubAuth.clientID,
    		clientSecret: configAuth.githubAuth.clientSecret,
    		callbackURL : configAuth.githubAuth.callbackURL
    	},
    	function (token, refreshToken, profile, done) {
    	  process.nextTick(function () { // Fire User.findOne when we have all our data back

			User.findOne({ 'github_id': profile.id }, function (err, user) {
				if (err) {
				    return done(err);
				}

                //If the user is found then log them in
				if (user) {
					return done(null, user);

                // If not, create it
				} else {
				    user = new User({
				        username   : profile.username,
				        github_id  : profile.id
					});
					user.save(function (err) {
						if (err) throw err;
						return done(null, user);
					});
				}
			});

    	  });
    	}
    ));
};