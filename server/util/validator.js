var _ = require('lodash');

var validator = {
  missing: function (obj, required) {
    var missing;

    if (!_.isObject(obj)) {
      missing = _.clone(required);
    } else if (!_.isArray(required)) {
      missing = [];
    } else {
      missing = _.difference(required, _.keys(obj));
    }

    return missing;
  },

  failOnMissing: function (obj, required, res) {
    var missing = this.missing(obj, required);

    if (missing.length) {
      this.failParam(res, 'Must include ' + missing.join(', '));
      return true;
    } else {
      return false;
    }
  },

  failServer: function (res, error) {
    var errorMsg = (error && error.toString()) || 'Internal Server Error';
    res.send(500, errorMsg);
  },

  failParam: function (res, error) {
    var errorMsg = (error && error.toString()) || 'Bad Request';
    res.send(400, errorMsg);
  },

  failNotFound: function (res, error) {
    var errorMsg = (error && error.toString()) || 'Not Found';
    res.send(404, errorMsg);
  }
};

module.exports = validator;
