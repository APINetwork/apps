var PDM = require('personal-data-module');
var TokenStore = require('../lib/token-store');

var datamodule = new PDM.DataModule({
  services: ['facebook', 'twitter', 'gmail']
});

var pdmRoutes = function (app) {

  app.get('/getUri', function(req, res) {
    datamodule.fetcher.fetch(
      new TokenStore.UserStore(req),
      req.query.uri,
      function(error, result) {
        if (error) {
          res.json(error);
        }
        else {
          res.send(result);
        }
      }
   );
  });
};

module.exports = pdmRoutes;
