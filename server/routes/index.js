var httpController = require('../views/http/index');

var routes = function (app) {
  require('./oauth-routes')(app);
  require('./static-pages-routes')(app);
  require('./login-logout-routes')(app);
  require('./admin-routes')(app);
  require('./account-routes')(app);
  require('./api-routes')(app);
  require('./user-routes')(app);
  require('./pdm-routes')(app);

  // Used by Phusion Passenger to "wake up" node process on nginx server start
  app.get('/status', function (req, res) {
    res.send('OK');
  });

  app.get('/fail', function (req, res) {
    res.send('Fail');
  });

  // route not found
  app.all('*', httpController.http404);
};

module.exports = routes;
