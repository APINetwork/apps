var _ = require('lodash');
var util = require('util');
var validIdReg = new RegExp("^[0-9a-fA-F]{24}$");

function HttpError(httpStatus, message) {
  Error.captureStackTrace(this, this.constructor);
  this.name = 'HttpError';
  this.message = message;
  this.httpStatus = httpStatus;
}
util.inherits(HttpError, Error);
HttpError.prototype.getHttpStatus = function () {
  return this.httpStatus;
};

var validator = {

  HttpError: HttpError,

  missing: function (obj, required) {
    var missing;

    // Ensure required is an array
    if (!_.isArray(required)) required = [required];

    if (!_.isObject(obj)) {
      // If obj isn't an object, than it can't contain any properties; thus, all required are
      // missing.
      missing = _.clone(required);
    } else {
      missing = _.difference(required, _.keys(obj));
    }

    return missing;
  },

  validId: function (id) {
    return validIdReg.test(id);
  },

  fail: function (res, error) {
    switch (error.httpStatus) {
      case 400:
        this.failBadRequest(res, error);
        break;
      case 401:
        this.failUnauthorized(res, error);
        break;
      case 404:
        this.failNotFound(res, error);
        break;
      default:
        this.failServer(res, error);
    }
  },

  failOnMissing: function (res, obj, required) {
    var missing = this.missing(obj, required);

    if (missing.length) {
      this.failParam(res, 'Required field(s) are missing: ' + missing.join(', '));
      return true;
    } else {
      return false;
    }
  },

  failServer: function (res, error) {
    var errorMsg = 'Internal Server Error';
    console.error(error.stack, '\n    [500 error stack trace]');
    res.status(500).json({ error: errorMsg });
  },

  failBadRequest: function (res, error) {
    var errorMsg = error instanceof Error ? error.message : error || 'Bad Request';
    console.warn(error.stack, '\n    [400 error stack trace]');
    res.status(400).json({ error: errorMsg });
  },

  failUnauthorized: function (res, error) {
    var errorMsg = error instanceof Error ? error.message : error || 'Not Authorized';
    console.warn(401, error);
    res.status(401).json({ error: errorMsg });
  },

  failNotFound: function (res, error) {
    debugger;
    var errorMsg = error instanceof Error ? error.message : error || 'Not Found';
    console.warn(404, error);
    res.status(404).json({ error: errorMsg });
  }
};

module.exports = validator;
