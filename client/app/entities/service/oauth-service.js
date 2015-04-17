define(function (require) {
  var Service = require('entities/service/service');

  var OauthService = Service.extend({

    defaults: _.defaults({
      connectionData: undefined,

      // View only
      callbackUrl:    'https://apinetwork.co/oauth/subauth/callback/',
      clientId:       undefined,
      clientSecret:   undefined
    }, Service.prototype.defaults),

    parse: function () {
      var attrs = OauthService.__super__.parse.apply(this, arguments);
      if (attrs && attrs.connectionData) {
        attrs.clientId = attrs.connectionData.clientId;
        attrs.clientSecret = attrs.connectionData.clientSecret;
      }
      return attrs;
    },

    toJSON: function () {
      var attrs = _.clone(this.attributes);
      attrs.connectionData = {
        clientId: attrs.clientId,
        clientSecret: attrs.clientSecret
      };
      // Omitting view-only attributes from transmission to server
      return _.omit(attrs, 'callbackUrl', 'clientId', 'clientSecret');
    }
  });

  return OauthService;
});
