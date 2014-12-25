define(function (require) {
  var Marionette = require('marionette');
  var Syphon = require('backbone.syphon');
  var DeleteConfirmView = require('modules/editor/services/service-edit-view/delete-confirm/delete-confirm.view');
  var Radio = require('backbone.radio');
  var template = require('hgn!modules/editor/services/service-edit-view/service-edit.view');

  var ServiceEditView = Marionette.ItemView.extend ({
    template: template,

    className: 'service-edit-form',

    events: {
      'submit form': 'formSubmitted',
      'click .js-remove-service': 'deleteConfirm'
    },

    onRender: function () {
      var title = 'Edit ' + this.model.get('name') + ' Settings';
      var description = 'View and edit your settings below:';
      var $title = $('<h2>', { text: title, class: 'header' });
      var $description = $('<div>', { text: description, class: 'subheader' });
      this.$el.prepend($title, $description);
    },

    formSubmitted: function (e) {
      // Prevents the form from doing a default submit + page refresh
      e.preventDefault();

      // Gets all the name:value's for the forms elements with a "name"
      var attrs = Syphon.serialize(this);
      Radio.command('editor', 'update:service', this.model, attrs);
      if (!this.model.validationError) Radio.command('modal', 'close:modal');
    },

    deleteConfirm: function () {
      var deleteConfirmView = new DeleteConfirmView({
        model: this.model
      });
      Radio.channel('modal').command('show:modal', deleteConfirmView);
    }
  });

  return ServiceEditView;
});
