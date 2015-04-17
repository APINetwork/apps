// Adapted from https://github.com/curtislacy/multi-passport

var passport = require('passport-strategy');
var util = require('util');
var _ = require('lodash');

var expiredInterval = 3600000;    // 1 hour
var purgeExpiredInterval = 60000; // 1 minute

function MultiStrategy(passport) {
  passport.Strategy.call(this);

  this.name = 'multi';
  this.strategyTypes = {};
  this.passport = passport;

  var self = this;

  function purgeExpired() {
    var curTime = Date.now();
    var strategies = Object.keys(self.passport._strategies);
    var expired = [];

    _.reduce(strategies, function (expired, stratKey) {
      var strategy = self.passport._strategy(stratKey);
      var expire = strategy.lastUsed && curTime - strategy.lastUsed > expiredInterval;
      if (expire) expired.push(stratKey);
      return expired;
    }, expired);

    expired.forEach(function (stratKey) {
      self.passport.unuse(stratKey);
    });
    setTimeout(purgeExpired, purgeExpiredInterval);
  }
  setTimeout(purgeExpired, purgeExpiredInterval);
}

util.inherits(MultiStrategy, passport.Strategy);

MultiStrategy.prototype.register = function (type, strategyClass, extendOptions, handler) {
  this.strategyTypes[type] = {
    strategyClass: strategyClass,
    extendOptions: extendOptions,
    handler: handler
  };
};

// TODO: Document
MultiStrategy.prototype.authenticate = function (req, options) {
  options = options || {};

  var next = options.next;
  var type = options.type;
  var clientApp = options.clientApp;
  var connectionData = options.connectionData;

  if (!next) throw new Error('\'next\' is a required option');
  if (!type) throw new Error('\'type\' is a required option');
  if (!clientApp) throw new Error('\'clientApp\' is a required option');

  var stratKey = clientApp + ':' + type;
  var remoteStrategy = this.passport._strategy(stratKey);

  if (!remoteStrategy) {
    var strategyType = this.strategyTypes[type];
    var StrategyClass = strategyType.strategyClass;
    var strategyOptions = strategyType.extendOptions(connectionData);
    var strategyHandler = strategyType.handler;
    remoteStrategy = new StrategyClass(strategyOptions, strategyHandler);
    this.passport.use(stratKey, remoteStrategy);
  }

  remoteStrategy.lastUsed = Date.now();
  this.passport.authenticate(stratKey, { session: false })(req, req.res, next);
};


module.exports = MultiStrategy;
