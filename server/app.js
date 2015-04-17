'use strict';

process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

if (~process.argv.indexOf('mode_dev')) {
  global.mode_dev = true;
  console.log('Server started in dev mode.');
}

// dependencies
var express        = require('express');
var session        = require('express-session');
var MongoStore     = require('connect-mongo')(session);
var http           = require('http');
var path           = require('path');
var passport       = require('passport');
// Wrapping mongoose in mongoose-q for conversion to q promises
var mongoose       = require('mongoose-q')(require('mongoose'));
var helmet         = require('helmet');
var serveStatic    = require('serve-static');
var bodyParser     = require('body-parser');
var morgan         = require('morgan');
var compression    = require('compression');
var methodOverride = require('method-override');
var cookieParser   = require('cookie-parser');

var config         = require('./config');
var multiPassport = require('./lib/multi-passport.js');
var localPassport = require('./lib/local-passport');
var routes        = require('./routes');
var sendmailUtil  = require('./util/sendmail');
var slugifyUtil   = require('./util/slugify');
var workflowUtil  = require('./util/workflow');

// create express app
var app = express();

// keep reference to config
app.config = config;

// setup the web server
app.server = http.createServer(app);

// setup mongoose
app.db = mongoose.createConnection(config.mongodb.uri);
app.db.on('error', console.error.bind(console, 'mongoose connection error: '));
app.db.once('open', function () {
  // and... we have a data store
});

// use mongo for session storage
app.use(session({
  secret: config.cryptoKey,
  store: new MongoStore({ url: config.mongodb.uri }),
  cookie: { maxAge: 2592000000 } // 1 Month in milliseconds
}));

// config data models
require('./models')(app, mongoose);

// basic settings
app.disable('x-powered-by');
app.set('port', config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// request logging
app.use(morgan('dev'));

// gzip compression
app.use(compression());

// static server app content
app.use(serveStatic(path.join(__dirname, 'public')));

// static client app content
app.use('/client', serveStatic(path.join(__dirname, '../client/build')));

// accept content as url-encoded or JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// handle json syntax errors without a 500
app.use(function (error, req, res, next) {
  if (error instanceof SyntaxError) {
    res.send(400, error.message);
  } else {
    next();
  }
});

// other
app.use(methodOverride());
app.use(cookieParser());

// basic express security settings
helmet.defaults(app);

// inititalize passport
app.use(passport.initialize());
app.use(passport.session());
app.passport = passport;

// set up local access passport
localPassport(app);

// set up app-dynamic remote API authentication handlers
multiPassport.register(passport);

// set up routes
routes(app, passport);

// response locals--available to all view templates
app.use(function (req, res, next) {
  res.locals.user = {};
  res.locals.user.defaultReturnUrl = req.user && req.user.defaultReturnUrl();
  res.locals.user.username = req.user && req.user.username;
  next();
});

// global locals--available to all view templates
app.locals.projectName = app.config.projectName;
app.locals.copyrightYear = new Date().getFullYear();
app.locals.copyrightName = app.config.companyName;
app.locals.cacheBreaker = 'br34k-01';

app.use(require('./views/http/index').http500);

app.utility = {};
app.utility.sendmail = sendmailUtil;
app.utility.slugify = slugifyUtil;
app.utility.workflow = workflowUtil;

app.server.listen(app.config.port, function () {
  console.log('Listening on ' + app.config.port + '...');
});

module.exports = app;
