var multiPassport = require('multi-passport');
var PassportFacebook = require('passport-facebook');
var PassportTwitter = require('passport-twitter');

function saveServiceToken(req, tokenSet, done) {
  var session = req.session;
  if (!session.appTokens) session.appTokens = {};
  var appToken = session.appTokens[session.lastClientId];
  var service = session.lastService;

  if (!appToken || !service) {
    done(new Error('Problem retrieving appToken or serviceId. Please report to support.'));
    return;
  }

  req.app.db.models.ServiceToken
    .findOne({
      service: service._id,
      appToken: appToken.token
    })
    .execQ()
    .then(function (serviceToken) {
      // If this service has tokens already, update and move on
      if (serviceToken) {
        serviceToken.tokenSet = tokenSet;
        return serviceToken.saveQ();
      }
      // If this service does not have tokens, create them and move on
      else {
        return req.app.db.models.ServiceToken.createQ({
          service: service._id,
          appToken: appToken.token,
          tokenSet: tokenSet
        });
      }
    })
    .then(function (serviceToken) {
      if (!serviceToken) {
        throw new Error('Issue saving service token');
      }
      done(null, {});
    })
    .catch(function (error) {
      done(error);
    })
    .done();
}

module.exports = {

  register: function (passport) {

    var multipass = new multiPassport.Strategy(passport);

    multipass.register('facebook', PassportFacebook.Strategy,
      // Prepare Passport request with app tokens
      function (connectionData) {
        return {
          clientID: connectionData.clientId,
          clientSecret: connectionData.clientSecret,
          callbackURL: 'http://local.apinetwork.co:3000/oauth/subauth/callback/',
          passReqToCallback: true
        };
      },
      // Handle successful authorization response
      function (req, accessToken, refreshToken, profile, done) {
        var tokenSet = {
          accessToken: accessToken
        };
        saveServiceToken(req, tokenSet, done);
      });

    multipass.register('twitter', PassportTwitter.Strategy,
      function (connectionData) {
        return {
          consumerKey: connectionData.clientId,
          consumerSecret: connectionData.clientSecret,
          callbackUrl: 'http://local.apinetwork.co:3000/oauth/subauth/callback/',
          passReqToCallback: true
        };
      },
      function (req, token, tokenSecret, profile, done) {
        var tokenSet = {
          token: token,
          tokenSecret: tokenSecret
        };
        saveServiceToken(req, tokenSet, done);
      });

    passport.use(multipass);
  }
};
