var YelpHandler = require(process.cwd() + '/app/controllers/yelp.js'),
    yelpHandler = new YelpHandler(),
    planHandler = require(process.cwd() + '/app/controllers/plan.js');

module.exports = function (app) {
    
    // pages that require an authenticated user redirect to /login
    function isLoggedIn(req, res, next) {
		if (req.isAuthenticated()) {
			return next();
		} else {
			res.redirect('/login');
		}
    }

    // homepage
    app.get('/', function(req, res){
        res.render('index', {
            GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
        });
    });
    
    // query yelp api
    app.get('/search', yelpHandler.search);
    app.post('/plan', isLoggedIn, planHandler.go);
};