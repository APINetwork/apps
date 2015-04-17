var oauthController = require('../controllers/oauth-controller');

var apiRoutes = function (app) {

  // External route called by end user to initiate generation of serviceTokens and an appToken
  app.get('/oauth/auth/:clientId/', oauthController.auth);

  // External route called by client app to trade appToken + clientSecret for an accessToken
  app.get('/oauth/auth/:clientId/access_token/', oauthController.accessToken);

  // External route called by anyone with an accessToken to determine which services are authorized
  app.get('/oauth/authorized/', oauthController.authorized);

  // "Internal" route where user is redirected after calling /oauth/auth/:clientId.
  // Not a point of entry for client app or end user.
  app.get('/oauth/subauth/', oauthController.subauth);

  // "Internal" route where user is redirected after authorizing with an Oauth service.
  // This URL should be what the client app registers as an Oauth callback with, e.g, Facebook. 
  app.get('/oauth/subauth/callback/',
    oauthController.subauthCallback, oauthController.subauthCallbackComplete);
};

module.exports = apiRoutes;
