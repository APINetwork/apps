define(function (require) {
  var Backbone = require('backbone');
  var Marionette = require('marionette');

  var HasState = {

    // Default state overridable by constructor 'state' option
    defaultState: undefined,

    // Backbone model maintaining state
    state: undefined,

    // Initial state of model after defaults and constructor 'state' option
    initialState: undefined,

    initialize: function (options) {
      var state = (options || {}).state;

      if (state && state instanceof Backbone.Model) {
        this.state = state;
      } else {
        this.initialState = _.defaults({}, state, this.defaultState);
        this.state = new Backbone.Model(this.initialState);
      }

      if (this.stateEvents) this._attachStateEvents();
      if (this.serializeData) this._wrapSerializeData();

      this.on('destroy', this._cleanupState.bind(this));
    },

    setState: function () {
      return this.state.set.apply(this.state, arguments);
    },

    getState: function () {
      return this.state.get.apply(this.state, arguments);
    },

    _attachStateEvents: function () {
      Marionette.bindEntityEvents(this, this.state, this.stateEvents);
    },

    _detachStateEvents: function () {
      Marionette.unbindEntityEvents(this, this.state, this.stateEvents);
    },

    _wrapSerializeData: function () {
      this.serializeData = _.wrap(this.serializeData, this._serializeDataWrapper);
    },

    _serializeDataWrapper: function (serializeData) {
      var origArgs = Array.prototype.slice.call(this, 1);
      var data = serializeData.apply(this, origArgs);
      data.state = this.state.toJSON();
      return data;
    },

    resetState: function () {
      this.state.set(this.initialState, { unset: true });
    },

    _cleanupState: function () {
      if (this.stateEvents) this._detachStateEvents();
      this.state.destroy();
      this.state = null;
    }
  };

  return HasState;
});
