'use strict';
var fs = require('fs');

module.exports = function(app, mongoose){

    // Tpl rendering checking project views
    app.use(function(req, res, next) {
        res.renderExtends = function renderExtends(view, options, callback) {
            var root = this.req.app.get('views');

            if (fs.existsSync(root + '/' + view + '.' + this.req.app.get('view engine'))) {
                return this.render(view, options, callback);
            }
            return this.render(__dirname + '/views/' + view, options, callback);
        };
        next();
    });
    app.use(require('cookie-parser')());

    // Auth
    var passport = require('passport');
    require('./app/config/passport')(passport); // Auth handler
    
    // Session + MongoDB session store
    var session    = require('express-session'),
        MongoStore = require('connect-mongo')(session);

    app.use(session({
        secret: 'ce0c04361d',
        resave: true,
        saveUninitialized: true,
        cookie: {maxAge: 24 * 60 * 60 * 1000}, // 1 day
        
        // Save session in database (so it doesn't get lost when server stops)
        store: new MongoStore({
            mongooseConnection: mongoose.connection,
            autoRemove: 'interval',  // remove expired sessions
            autoRemoveInterval: 30,  // check every 30 min
            touchAfter: 12 * 3600    // update db only one time in a period of 12 hours
        })
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    // Set user variable for views
    app.use(function(req, res, next){
        res.locals.user   = req.user;
        res.locals.github = !!process.env.GITHUB_KEY; 
        next();
    });

    // Add routing
    var routes = require('./app/routes/index.js');
    routes(app);
};