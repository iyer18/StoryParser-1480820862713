/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// Install tools required for app to work
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cfenv = require('cfenv');
var mongoose = require('mongoose');
var passport = require('passport');

// create a new express server
var app = express();


// connect MongoDB
mongoose.connect('mongodb://a084c80d-a0dc-4b9a-8416-21dae9f1ba86:5de4be26-2a8a-4fc0-9d7e-198a1bb70f85@23.246.199.101:10079/db', function(err,db){
    if (!err){
        console.log('Connected to host!');
    } else{
        console.dir(err); //failed to connect
    }
});
// set up access to Schemas
require('./models/Stories');
require('./models/Lines');
require('./models/Users');
require('.passport');
// Set up access to js files
var routes = require('./routes/index');
var users = require('./routes/users');
// Set up access to view files
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use('/', routes);
app.use('/users', users);

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// development error handler
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
module.exports = app;
