var validator = require('../util/validator');
var HttpError = validator.HttpError;
var uuid = require('node-uuid');
var Q = require('q');
var url = require('url');
var util = require('util');

function NoServiceTokenError(service, message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = 'HttpError';
  this.message = message;
  this.service = service;
}
util.inherits(NoServiceTokenError, Error);
NoServiceTokenError.prototype.getService = function () {
  return this.service;
};

function redirectToAppCallback(res, app, appToken) {
  var oauthCallback = app.oauthCallback;
  var token = appToken.token;
  var urlObj;

  // Parse callback URL and add client app token to query parameter
  urlObj = url.parse(oauthCallback);
  if (urlObj.search) {
    urlObj.search += '&appToken=' + token;
  }
  else {
    urlObj.search = 'appToken=' + token;
  }
  oauthCallback = url.format(urlObj);

  // Redirect user to callback
  res.redirect(oauthCallback);
}

var oauthController = {

  authorized: function (req, res) {
    var appToken = req.query.appToken;
    req.app.db.models.ServiceToken
      // Find App model from clientId
      .find({
        appToken: appToken
      })
      .populate('service')
      .execQ()
      .then(function (serviceTokens) {
        if (!serviceTokens) serviceTokens = [];
        var authorizedServices = serviceTokens.map(function (serviceToken) {
          return serviceToken.service.type;
        });
        res.json(authorizedServices);
      });
  },

  accessToken: function (req, res) {
    var clientId = req.params.clientId;
    var clientSecret = req.query.clientSecret;
    var token = req.query.appToken;

    req.app.db.models.App
      // Find App model from clientId
      .findOne({
        clientId: clientId,
        clientSecret: clientSecret
      })
      .execQ()
      // Find AppToken for App model
      .then(function (app) {
        if (!app) {
          throw new HttpError(404, 'Invalid clientId or clientSecret');
        }

        var appToken = req.app.db.models.AppToken
          .findOne({
            app: app._id,
            token: token
          })
          .execQ();

        return [app, appToken];
      })
      .spread(function (app, appToken) {
        if (!appToken) {
          throw new HttpError(404, 'No or invalid appToken; must authenticate first.');
        } else if (appToken.used) {
          throw new HttpError(400, 'appToken has already been used.');
        }

        var accessToken = req.app.db.models.AccessToken
          .createQ({
            token: uuid.v4(),
            app: app._id,
            appToken: appToken.token
          });
        var updatingAppToken = req.app.db.models.AppToken
          .findOneAndUpdate({
            token: appToken.token
          }, {
            used: true
          })
          .execQ();

        return [updatingAppToken, accessToken];
      })
      .spread(function (appToken, accessToken) {
        if (!accessToken) {
          validator.failServer(res, new Error('Problem creating accessToken.'));
          return;
        } else if (!appToken) {
          validator.failServer(res, new Error('Problem updating appToken.'));
          return;
        }

        res.json({ accessToken: accessToken.token });
      })
      .catch(function (error) {
        validator.fail(res, error);
      })
      .done();
  },

  auth: function (req, res) {
    var session = req.session;
    var clientId = req.params.clientId;

    if (!session.appTokens) session.appTokens = {};

    req.app.db.models.App
      // Find App model from clientId
      .findOne({
        clientId: clientId
      })
      .execQ()
      // Find AppToken for App model
      .then(function (app) {
        if (!app) {
          throw new HttpError(404, 'Invalid clientId');
        }

        var appToken = req.app.db.models.AppToken
          .createQ({
            token: uuid.v4(),
            app: app._id
          });

        return [app, appToken];
      })
      // Save AppToken to session
      .spread(function (app, appToken) {
        session.appTokens[clientId] = appToken;
        session.lastClientId = clientId;
        session.lastApp = app;
        return Q.denodeify(session.save.bind(session))();
      })
      // Redirect to subauth
      .then(function () {
        res.redirect('/oauth/subauth');
      })
      .catch(function (error) {
        validator.fail(res, error);
      })
      .done();
  },

  subauth: function (req, res, next) {
    var session = req.session;
    if (!session.appTokens) session.appTokens = {};
    var clientId = session.lastClientId;
    var appToken = session.appTokens[clientId];

    if (!clientId) {
      throw new HttpError(400, 'Bad request. Call /oauth/auth first.');
    } else if (!appToken) {
      throw new HttpError(500, 'Problem retrieving appToken.');
    }

    req.app.db.models.App
      .findOne({
        clientId: clientId
      })
      .execQ()
      // Get Services corresponding to App
      .then(function (app) {
        var services = req.app.db.models.Service
          .find({
            app: app._id
          })
          .execQ();
        return [app, services];
      })
      // Attempt authentication with services
      .spread(function (app, services) {
        if (!services) {
          // There are no services registered with the app; redirect back to the app.
          redirectToAppCallback(res, app, appToken);
        } else {
          return oauthController._authServices(req, res, next, app, appToken, services);
        }
      })
      .catch(function (error) {
        validator.fail(res, error);
      })
      .done();
  },

  // Given the list of all services for an app, authenticate the first un-authenticated service.
  _authServices: function (req, res, next, app, appToken, services) {
    // Perform a serial iteration over services and authenticate with the first service
    // without recent tokens.
    // Array reduce approach based loosely on https://github.com/kriskowal/q#sequences
    return services.reduce(function (previous, service) {
      return previous
        // Find service token for appToken
        .then(function () {
          return req.app.db.models.ServiceToken
            .findOne({
              appToken: appToken.token,
              service: service._id
            })
            .execQ();
        })
        .then(function (serviceToken) {
          // If service token does not exist, trigger service authentication.
          if (!serviceToken) {
            throw new NoServiceTokenError(service);
          }
        });
    }, Q())
    // All services have service tokens. Redirect to app callback with appToken.
    .then(function () {
      redirectToAppCallback(res, app, appToken);
    })
    .catch(function (error) {
      if (error instanceof NoServiceTokenError) {
        // Caught no service token; trigger authentication for service.
        return oauthController._authService(req, res, next, appToken, error.getService());
      } else {
        throw error;
      }
    });
  },

  _authService: function (req, res, next, appToken, service) {
    var session = req.session;
    session.lastService = service;

    // Save service id to session.
    return Q.denodeify(session.save.bind(session))()
      // Trigger multi-passport authentication for service.
      .then(function () {
        req.app.passport.authenticate('multi', {
          type: service.type,
          clientApp: appToken.token,
          connectionData: service.connectionData,
          next: next
        })(req, res, next);
      });
  },

  subauthCallback: function (req, res, next) {
    var session = req.session;
    var appToken = session.appTokens[session.lastClientId];
    var service = session.lastService;

    if (!appToken || !service) {
      validator.failServer(res, new Error('Problem retrieving appToken or service.'));
      return;
    }

    req.app.passport.authenticate('multi', {
      type: service.type,
      clientApp: appToken.token,
      next: next
    })(req, res, next);
  },

  subauthCallbackComplete: function (req, res) {
    var session = req.session;
    var app = session.lastApp;
    var appToken = session.appTokens[session.lastClientId];

    if (!app || !appToken) {
      validator.failServer(res, new Error('Problem retrieving app or appToken.'));
      return;
    }

    redirectToAppCallback(res, app, appToken);
  }
};

module.exports = oauthController;
