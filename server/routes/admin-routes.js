/* jshint maxstatements: 50 */
var authUtil = require('../util/auth-util');
var usersController = require('../views/admin/users/index');
var adminsController = require('../views/admin/administrators/index');
var adminGroupsController = require('../views/admin/admin-groups/index');
var accountsController = require('../views/admin/accounts/index');
var statusesController = require('../views/admin/statuses/index');
var categoriesController = require('../views/admin/categories/index');

var adminRoutes = function (app) {

  app.all('/admin/*', authUtil.ensureAuthenticated, authUtil.ensureAdmin);

  // admin
  app.get('/admin/', require('../views/admin/index').init);

  // admin > users
  app.get('/admin/users/', usersController.find);
  app.post('/admin/users/', usersController.create);
  app.get('/admin/users/:id/', usersController.read);
  app.put('/admin/users/:id/', usersController.update);
  app.put('/admin/users/:id/password/', usersController.password);
  app.put('/admin/users/:id/role-admin', usersController.linkAdmin);
  app.delete('/admin/users/:id/role-admin/', usersController.unlinkAdmin);
  app.put('/admin/users/:id/role-account/', usersController.linkAccount);
  app.delete('/admin/users/:id/role-account/', usersController.unlinkAccount);
  app.delete('/admin/users/:id/', usersController.delete);

  // admin > administrators
  app.get('/admin/administrators/', adminsController.find);
  app.post('/admin/administrators/', adminsController.create);
  app.get('/admin/administrators/:id/', adminsController.read);
  app.put('/admin/administrators/:id/', adminsController.update);
  app.put('/admin/administrators/:id/permissions/', adminsController.permissions);
  app.put('/admin/administrators/:id/groups/', adminsController.groups);
  app.put('/admin/administrators/:id/user/', adminsController.linkUser);
  app.delete('/admin/administrators/:id/use/', adminsController.unlinkUser);
  app.delete('/admin/administrators/:id/', adminsController.delete);

  // admin > admin groups
  app.get('/admin/admin-groups/', adminGroupsController.find);
  app.post('/admin/admin-groups/', adminGroupsController.create);
  app.get('/admin/admin-groups/:id/', adminGroupsController.read);
  app.put('/admin/admin-groups/:id/', adminGroupsController.update);
  app.put('/admin/admin-groups/:id/permissions/', adminGroupsController.permissions);
  app.delete('/admin/admin-groups/:id/', adminGroupsController.delete);

  // admin > accounts
  app.get('/admin/accounts/', accountsController.find);
  app.post('/admin/accounts/', accountsController.create);
  app.get('/admin/accounts/:id/', accountsController.read);
  app.put('/admin/accounts/:id/', accountsController.update);
  app.put('/admin/accounts/:id/user/', accountsController.linkUser);
  app.delete('/admin/accounts/:id/user/', accountsController.unlinkUser);
  app.post('/admin/accounts/:id/notes/', accountsController.newNote);
  app.post('/admin/accounts/:id/status/', accountsController.newStatus);
  app.delete('/admin/accounts/:id/', accountsController.delete);

  // admin > statuses
  app.get('/admin/statuses/', statusesController.find);
  app.post('/admin/statuses/', statusesController.create);
  app.get('/admin/statuses/:id/', statusesController.read);
  app.put('/admin/statuses/:id/', statusesController.update);
  app.delete('/admin/statuses/:id/', statusesController.delete);

  // admin > categories
  app.get('/admin/categories/', categoriesController.find);
  app.post('/admin/categories/', categoriesController.create);
  app.get('/admin/categories/:i/', categoriesController.read);
  app.put('/admin/categories/:id/', categoriesController.update);
  app.delete('/admin/categories/:i/', categoriesController.delete);

  // admin > search
  app.get('/admin/search/',
    require('../views/admin/search/index').find);
};

module.exports = adminRoutes;
