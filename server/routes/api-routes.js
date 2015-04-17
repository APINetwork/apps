var authUtil = require('../util/auth-util');
var appController = require('../controllers/app-controller');
var serviceController = require('../controllers/service-controller');

var apiRoutes = function (app) {

  app.all('/api/apps/*', authUtil.ensureAuthenticated);

  app.get('/api/apps/', appController.list);
  app.get('/api/apps/:id', appController.find);
  app.post('/api/apps/', appController.create);
  app.put('/api/apps/:id', appController.update);
  app.delete('/api/apps/:id', appController.destroy);

  app.get('/api/apps/:app/services/', serviceController.list);
  app.get('/api/apps/:app/services/:id', serviceController.find);
  app.post('/api/apps/:app/services/', serviceController.create);
  app.put('/api/apps/:app/services/:id', serviceController.update);
  app.delete('/api/apps/:app/services/:id', serviceController.destroy);
};

module.exports = apiRoutes;
