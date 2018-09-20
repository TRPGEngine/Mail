const debug = require('debug')('trpg:component:mail');
const nodemailer = require('nodemailer');
const event = require('./event');
const config = require('../config/config.json');

module.exports = function MailComponent(app) {
  initStorage.call(app);
  initFunction.call(app);
  initSocket.call(app);

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

function initFunction() {
  let app = this;
  app.mail = {
    async sendAsync (userUUID, from, to, subject, html) {
      // 发送邮件
      if(!userUUID || !from || !to || !subject || !html) {
        throw '邮件发送错误, 缺少参数';
      }

      let mailOptions = {
        from,
        to,
        subject,
        html,
      };

      let recordData = {
        user_uuid: userUUID,
        from,
        to,
        subject,
        body: html,
        host: config.host,
        port: config.port,
        secure: config.secure,
      }

      // 发送邮件
      try {
        let info = await sendMail(mailOptions);
        recordData.is_success = true;
        recordData.data = info;
      }catch(e) {
        recordData.is_success = true;
        recordData.error = e;
      }

      // 存储记录
      let db;
      try {
        db = await app.storage.connectAsync();
        await db.models.mail_record.createAsync(recordData);
      }finally {
        db.close();
      }

      return recordData;
    },
  };
}

function initSocket() {
  let app = this;
  app.registerEvent('mail::bindMail', event.bindMail);
}

function sendMail(mailOptions) {
  return new Promise(function(resolve, reject) {
    let transporter = nodemailer.createTransport(config);
    debug('sendMail:', mailOptions);

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        debug('sendMailError:', error);
        reject(error);
      } else {
        debug('sendMailSuccess:', info);
        resolve(info);
      }
    })
  })
}
