var authUtil = require('../util/auth-util');
var userController = require('../controllers/user-controller');

var userRoutes = function (app) {

  app.all('/api/users/*', authUtil.ensureAuthenticated);
  app.get('/api/users/:id/', userController.find);
};

module.exports = userRoutes;
