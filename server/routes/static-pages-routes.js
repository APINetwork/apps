var signupController = require('../views/signup/index');
var loginController = require('../views/login/index');
var aboutController = require('../views/about/index');
var contactController = require('../views/contact/index');
var helpController = require('../views/help/index');
var legalController = require('../views/legal/index');
var privacyController = require('../views/privacy/index');
var termsController = require('../views/terms/index');

var staticPagesRoutes = function (app) {

  app.get('/', loginController.init);
  app.get('/about/', aboutController.init);
  app.get('/contact/', contactController.init);
  app.post('/contact/', contactController.sendMessage);
  app.get('/help/', helpController.init);
  app.get('/legal/', legalController.init);
  app.get('/terms/', termsController.init);
  app.get('/privacy/', privacyController.init);

  // sign up
  app.get('/signup/', signupController.init);
  app.post('/signup/', signupController.signup);

  // social sign up
  // app.post('/signup/social/', signupController.signupSocial);
  // app.get('/signup/twitter/',
  //   app.passport.authenticate('twitter', {
  //     callbackURL: '/signup/twitter/callback/'
  //   }));
  // app.get('/signup/twitter/callback/', signupController.signupTwitter);
  // app.get('/signup/github/',
  //   app.passport.authenticate('github', {
  //     callbackURL: '/signup/github/callback/', scope: ['user:email']
  //   }));
  // app.get('/signup/github/callback/', signupController.signupGitHub);
  // app.get('/signup/facebook/',
  //   app.passport.authenticate('facebook', {
  //     callbackURL: '/signup/facebook/callback/', scope: ['email']
  //   }));
  // app.get('/signup/facebook/callback/', signupController.signupFacebook);
  // app.get('/signup/google/',
  //   app.passport.authenticate('google', {
  //     callbackURL: '/signup/google/callback/', scope: ['profile email']
  //   }));
  // app.get('/signup/google/callback/', signupController.signupGoogle);
  // app.get('/signup/tumblr/',
  //   app.passport.authenticate('tumblr', {
  //     callbackURL: '/signup/tumblr/callback/'
  //   }));
  // app.get('/signup/tumblr/callback/', signupController.signupTumblr);
};

module.exports = staticPagesRoutes;
