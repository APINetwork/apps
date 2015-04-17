var authUtil = require('../util/auth-util');
var verificationController = require('../views/account/verification/index');
var settingsController = require('../views/account/settings/index');
var accountController = require('../views/account/index');

var accountRoutes = function (app) {

  app.all('/account/*', authUtil.ensureAuthenticated, authUtil.ensureAccount);

  // account
  app.get('/account/', accountController.init);

  // account > verification
  app.get('/account/verification/', verificationController.init);
  app.post('/account/verification/', verificationController.resendVerification);
  app.get('/account/verification/:token/', verificationController.verify);

  // account > settings
  app.get('/account/settings/', settingsController.init);
  app.put('/account/settings/', settingsController.update);
  app.put('/account/settings/identity/', settingsController.identity);
  app.put('/account/settings/password/', settingsController.password);

  // account > settings > social
  // app.get('/account/settings/twitter/',
  //   app.passport.authenticate('twitter', {
  //     callbackURL: '/account/settings/twitter/callback/'
  //   }));
  // app.get('/account/settings/twitter/callback/', settingsController.connectTwitter);
  // app.get('/account/settings/twitter/disconnect', settingsController.disconnectTwitter);
  // app.get('/account/settings/github/',
  //   app.passport.authenticate('github', {
  //     callbackURL: '/account/settings/github/callback/'
  //   }));
  // app.get('/account/settings/github/callback/', settingsController.connectGitHub);
  // app.get('/account/settings/github/disconnect', settingsController.disconnectGitHub);
  // app.get('/account/settings/facebook/',
  //   app.passport.authenticate('facebook', {
  //     callbackURL: '/account/settings/facebook/callback/'
  //   }));
  // app.get('/account/settings/facebook/callback/', settingsController.connectFacebook);
  // app.get('/account/settings/facebook/disconnect', settingsController.disconnectFacebook);
  // app.get('/account/settings/google/',
  //   app.passport.authenticate('google', {
  //     callbackURL: '/account/settings/google/callback/', scope: ['profile email']
  //   }));
  // app.get('/account/settings/google/callback/', settingsController.connectGoogle);
  // app.get('/account/settings/google/disconnect', settingsController.disconnectGoogle);
  // app.get('/account/settings/tumblr/',
  //   app.passport.authenticate('tumblr', {
  //     callbackURL: '/account/settings/tumblr/callback/'
  //   }));
  // app.get('/account/settings/tumblr/callback/', settingsController.connectTumblr);
  // app.get('/account/settings/tumblr/disconnect', settingsController.disconnectTumblr);
};

module.exports = accountRoutes;
