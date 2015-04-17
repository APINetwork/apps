var _ = require('lodash');
var validator = require('../util/validator');

var serviceController = {

  list: function (req, res) {
    if (!validator.validId(req.params.app)) {
      validator.failNotFound(res);
      return;
    }

    req.app.db.models.Service
      .find({
        app: req.params.app
      })
      .execQ()
      .then(function (connections) {
        res.json(connections);
      })
      .catch(validator.failServer.bind(null, res))
      .done();
  },

  find: function (req, res) {
    if (!validator.validId(req.params.app)) {
      validator.failNotFound(res);
      return;
    }

    req.app.db.models.Service
      .findOne({
        _id: req.params.id,
        app: req.params.app,
        owner: req.user._id
      })
      .execQ()
      .then(function (service) {
        if (!service) {
          validator.failNotFound(res);
        } else {
          res.json(service);
        }
      })
      .catch(validator.failServer.bind(null, res))
      .done();
  },

  create: function (req, res) {
    if (!validator.validId(req.params.app)) {
      validator.failNotFound(res);
      return;
    }

    // Set app based on path param
    var _service = _.extend({
      app: req.params.app,
      owner: req.user._id
    }, _.pick(req.body, [
      'type',
      'connectionData'
    ]));

    req.app.db.models.Service
      .createQ(_service)
      .then(function (service) {
        return res.json(service);
      })
      .catch(validator.failServer.bind(null, res))
      .done();
  },

  update: function (req, res) {
    if (!validator.validId(req.params.app)) {
      validator.failNotFound(res);
      return;
    }

    // Do not allow changing of app
    var _service = _.extend({}, _.pick(req.body, [
      'type',
      'connectionData'
    ]));

    req.app.db.models.Service
      .findOneAndUpdate({
        _id: req.params.id,
        app: req.params.app,
        owner: req.user._id
      }, _service)
      .execQ()
      .then(function (service) {
        if (!service) {
          validator.failNotFound(res);
        } else {
          res.status(204).send();
        }
      })
      .catch(validator.failServer.bind(null, res))
      .done();
  },

  destroy: function (req, res) {
    if (!validator.validId(req.params.app)) {
      validator.failNotFound(res);
      return;
    }

    req.app.db.models.Service
      .findOneAndRemove({
        _id: req.params.id,
        app: req.params.app,
        owner: req.user._id
      })
      .execQ()
      .then(function (service) {
        if (!service) {
          validator.failNotFound(res);
        } else {
          // Workaround to trigger 'remove' hooks
          // https://github.com/learnboost/mongoose/issues/1241#issuecomment-39104584
          service.remove();
          res.json(service);
        }
      })
      .catch(validator.failServer.bind(null, res))
      .done();
  }
};

module.exports = serviceController;
