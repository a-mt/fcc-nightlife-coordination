var YelpHandler = require(process.cwd() + '/app/controllers/yelp.js'),
    yelpHandler = new YelpHandler();

module.exports = function (app) {
    
    // homepage
    app.get('/', function(req, res){
        res.render('index', {
            GOOGLE_API_KEY: process.env.GOOGLE_API_KEY
        });
    });
    
    // query yelp api
    app.get('/search', yelpHandler.search);

}