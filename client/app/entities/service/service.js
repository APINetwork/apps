define(function (require) {
  var Backbone = require('backbone');

  var monthNames = new Array(
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  );

  // This is the "Base Service" that sets shared properties on any specific service
  var Service = Backbone.Model.extend({

    urlRoot: function () {
      return '/api/apps/'
        + (this.collection && this.collection.getAppId() || this.get('appId'))
        + '/services/';
    },

    idAttribute: '_id',

    defaults: {
      _id:            undefined,
      app:            undefined, // Owning app id
      type:           undefined, // Keyable service type; e.g., 'facebook' or 'twitter'
                                 // NOTE: Don't attempt to update this; prefer to re-create,
                                 //   due to its usage in Services polymorphic model function.

      // Read only
      connectionData: undefined,
      createdAt:      undefined, // TODO: Not yet implemented on server
      owner:          undefined,

      // View only
      iconClass:      undefined,
      name:           undefined,
      dateAdded:      undefined
    },

    originalType: undefined,

    constructor: function () {
      this.on({
        'change:type': this.onChangeType
      }, this);
      Service.__super__.constructor.apply(this, arguments);
    },

    validate: function (attrs, options) {
      if (!_.isUndefined(this.originalType) && attrs.type !== this.originalType) {
        return "Can't change a service type; please remove and create a new one.";
      }
    },

    onChangeType: function (service, type) {
      if (_.isUndefined(this.previous('type'))) {
        this.originalType = this.get('type');
      }
    },

    parse: function () {
      var attrs = Service.__super__.parse.apply(this, arguments);

      if (attrs && attrs.createdAt) {
        var dateTime = new Date(Date.parse(attrs.createdAt));
        var month = monthNames[dateTime.getMonth()];
        var day = dateTime.getDate();
        var year = dateTime.getFullYear();
        var dateFormatted = month + ' ' + day + ', ' + year;
        attrs.dateAdded = dateFormatted;
      }

      return attrs;
    },

    toJSON: function () {
      var attrs = Service.__super__.toJSON.apply(this, arguments);
      return _.omit(attrs, 'iconClass', 'name', 'dateAdded');
    }
  });

  return Service;
});
