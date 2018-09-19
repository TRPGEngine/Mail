const debug = require('debug')('trpg:component:mail');

module.exports = function MailComponent(app) {
  initStorage.call(app);

  return {
    name: 'MailComponent',
    require: [
      'PlayerComponent',
    ],
  }
}

function initStorage() {
  let app = this;
  let storage = app.storage;
  storage.registerModel(require('./models/list.js'));
  storage.registerModel(require('./models/record.js'));

  app.on('initCompleted', function(app) {
    // 数据信息统计
    debug('storage has been load 2 mail db model');
  });
}
