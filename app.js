var express    = require('express'),
    app        = express(),
    bodyparser = require('body-parser'),
    routes     = require('./app/routes/index.js'),
    login      = require('login');

require('dotenv').load();

// Connect DB
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;

// Handle requests
app.use(require('connect-flash')());
app.use(bodyparser.urlencoded({extended: false}));
app.set('view engine', 'pug');
app.use('/public', express.static(process.cwd() + '/public'));
login(app, mongoose);
routes(app);

// Start server
var port = process.env.PORT || 8080;
app.listen(port, function(){
   console.log('The server is listening on port ' + port); 
});

