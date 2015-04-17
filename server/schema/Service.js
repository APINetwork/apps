'use strict';

module.exports = function (app, mongoose) {
  var serviceSchema = new mongoose.Schema({
    app: { type: mongoose.Schema.Types.ObjectId, ref: 'App' },
    type: String,
    connectionData: mongoose.Schema.Types.Mixed,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  });

  serviceSchema.index({ app: 1 });
  serviceSchema.index({ owner: 1 });
  serviceSchema.set('autoIndex', (app.get('env') === 'development'));

  serviceSchema.pre('remove', function (next) {
    // Remove my associated ServiceTokens
    app.db.models.ServiceToken.remove({ service: this._id }).execQ()
      .catch(next).done();

    // Remove myself from my parent's child Service IDs array
    app.db.models.App.findById(this.app, function (err, app) {
      if (err) return next(err);
      if (app) {
        app.services.pull(this._id);
        return app.save(next);
      }
      return next();
    }.bind(this));

    next();
  });

  serviceSchema.pre('save', function (next) {
    // Add myself to my parent's child Service IDs array
    app.db.models.App.findById(this.app, function (err, app) {
      if (err) return next(err);
      if (app) {
        app.services.push(this);
        return app.save(next);
      }
      return next();
    }.bind(this));
  });

  app.db.model('Service', serviceSchema);
};
