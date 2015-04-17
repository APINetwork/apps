var loginController = require('../views/login/index');
var forgotController = require('../views/login/forgot/index');
var resetController = require('../views/login/reset/index');
var logoutController = require('../views/logout/index');

var loginLogoutRoutes = function (app) {

  // login/out
  app.get('/login/', loginController.init);
  app.post('/login/', loginController.login);
  app.get('/login/forgot/', forgotController.init);
  app.post('/login/forgot/', forgotController.send);
  app.get('/login/reset/', resetController.init);
  app.get('/login/reset/:mail/:token/', resetController.init);
  app.put('/login/reset/:email/:token/', resetController.set);
  app.get('/logout/', logoutController.init);

  // social login
  // app.get('/login/twitter/',
  //   app.passport.authenticate('twitter', {
  //     callbackURL: '/login/twitter/callback/'
  //   }));
  // app.get('/login/twitter/callback/', loginController.loginTwitter);
  // app.get('/login/github/',
  //   app.passport.authenticate('github', {
  //     callbackURL: '/login/github/callback/'
  //   }));
  // app.get('/login/github/callback/', loginController.loginGitHub);
  // app.get('/login/facebook/',
  //   app.passport.authenticate('facebook', {
  //     callbackURL: '/login/facebook/callback/'
  //   }));
  // app.get('/login/facebook/callback/', loginController.loginFacebook);
  // app.get('/login/google/',
  //   app.passport.authenticate('google', {
  //     callbackURL: '/login/google/callback/', scope: ['profile email']
  //   }));
  // app.get('/login/google/callback/', loginController.loginGoogle);
  // app.get('/login/tumblr/',
  //   app.passport.authenticate('tumblr', {
  //     callbackURL: '/login/tumblr/callback/', scope: ['profile email']
  //   }));
  // app.get('/login/tumblr/callback/', loginController.loginTumblr);
};

module.exports = loginLogoutRoutes;
