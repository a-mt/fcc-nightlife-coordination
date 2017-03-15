var User = require('../models/users-local');

module.exports = function (passport) {

    // Serialize and deserialize user instances to and form the session
	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id, function (err, user) {
			done(err, user);
		});
	});

	// Local auth or via github
	require('./passport-local')(passport);
	
	if(process.env.GITHUB_KEY) {
		require('./passport-github')(passport);
	}
};