'use strict';

exports = module.exports = function(app, mongoose) {
  // embeddable docs first
  require('./schema/Note')(app, mongoose);
  require('./schema/Status')(app, mongoose);
  require('./schema/StatusLog')(app, mongoose);
  require('./schema/Category')(app, mongoose);

  // then regular docs
  require('./schema/User')(app, mongoose);
  require('./schema/Admin')(app, mongoose);
  require('./schema/AdminGroup')(app, mongoose);
  require('./schema/Account')(app, mongoose);
  require('./schema/LoginAttempt')(app, mongoose);

  // API Network Apps and Services
  require('./schema/App')(app, mongoose);
  require('./schema/Service')(app, mongoose);

  // API Network OAuth tokens
  require('./schema/AppToken')(app, mongoose);
  require('./schema/ServiceToken')(app, mongoose);
  require('./schema/AccessToken')(app, mongoose);
};
