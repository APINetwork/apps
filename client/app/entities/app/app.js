define(function (require, exports, module) {
  var Backbone = require('backbone');
  var ServicesCollection = require('entities/service/services');
  var logger = require('lib/util/logger')(module);

  var monthNames = new Array(
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  );

  // Maintaining consistency of sub entities requires { parse: true } option.
  // There are several different cases where this is necessary, explained below:
  // - New
  //     var model = new Model(attrs, { parse: true });
  // - Calling 'set' (no {parse:true} available)
  //     step.set(step.parse(attrs));
  // - Calling 'set' on a parent collection
  //     collection.set(array, { parse: true });
  // - Calling 'fetch'
  //     do nothing :) parse() is automatically called during a fetch
  var App = Backbone.Model.extend({

    urlRoot: '/api/apps',
    idAttribute: '_id',

    services: undefined,

    defaults: {
      _id:           undefined,
      description:   undefined,
      name:          undefined,
      oauthCallback: undefined,

      // Read only
      owner:         undefined,
      clientId:      undefined,
      clientSecret:  undefined,
      createdAt:     undefined,

      // View only
      dateAdded:     undefined
    },

    constructor: function (attrs, options) {
      this.services = new ServicesCollection();
      App.__super__.constructor.apply(this, arguments);
    },

    initialize: function (options) {
      this.on({
        'change:_id': this.onChangeId.bind(this),
        'change:createdAt': this.onChangeCreatedAt.bind(this),
        'destroy': this.onDestroy.bind(this)
      });
    },

    onChangeId: function (app, _id) {
      logger.debug('App id changed: ' + _id);
      this.services.setAppId(_id);
      this.services.reset();
    },

    onChangeCreatedAt: function (service, createdAt) {
      var dateFormatted = 'N/A';

      if (createdAt) {
        var dateTime = new Date(Date.parse(createdAt)),
          month = monthNames[dateTime.getMonth()],
          day = dateTime.getDate(),
          year = dateTime.getFullYear();
        dateFormatted = month + ' ' + day + ', ' + year;
      }

      this.set('dateAdded', dateFormatted);
    },

    // Extract 'services' into sub-collection
    parse: function (data, options) {
      options = _.extend(options, { parse: true });
      if (data && data.services) this.services.set(data.services, options);
      return _.omit(data, 'services');
    },

    onDestroy: function () {
      this.services.reset();
      // TODO: Make sure this is enough
      this.services.stopListening();
    },

    toJSON: function () {
      var attrs = App.__super__.toJSON.apply(this, arguments);
      return _.omit(attrs, 'dateAdded');
    }
  });

  return App;
});
