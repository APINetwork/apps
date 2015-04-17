'use strict';

module.exports = function (app, mongoose) {
  var appTokenSchema = new mongoose.Schema({
    app: { type: mongoose.Schema.Types.ObjectId, ref: 'App' },
    token: { type: String },
    used: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  });

  appTokenSchema.index({ app: 1 });
  appTokenSchema.index({ token: 1 });

  appTokenSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('AppToken', appTokenSchema);
};
