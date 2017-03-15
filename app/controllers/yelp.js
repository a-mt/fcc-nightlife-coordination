'use strict';
var Yelp = require('yelp');

function YelpHandler(){
    
    this.search = function(req, res){

        // Check parameter
        var location = req.query.location;
        if(!location) {
            res.status(400).send('Empty query');
            return;
        }

        // Secret Yelp
        var yelp = new Yelp({
          consumer_key: process.env.YELP_CONSUMER_KEY,
          consumer_secret: process.env.YELP_CONSUMER_SECRET,
          token: process.env.YELP_TOKEN,
          token_secret: process.env.YELP_TOKEN_SECRET
        });

        yelp.search({ term: 'bars', location: location.replace(/ /g, '+') })
        .then(function (data) {
          res.json(data);
        })
        .catch(function (err) {
          var response = JSON.parse(err.data);
          res.status(err.statusCode).send(response.error.text);
        });
    };
}

module.exports = YelpHandler;