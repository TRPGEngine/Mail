const debug = require('debug')('trpg:component:mail:event');
const querystring = require('querystring');
const config = require('../config/config');
const fromMail = config.auth.user;
const utils = require('./utils');

function getHost(socket) {
  const defaultHost = 'trpgapi.moonrailgun.com';
  let host = '';
  if(socket && socket.handshake && socket.handshake.headers && socket.handshake.headers.host) {
    host = socket.handshake.headers.host;
  }
  return host || defaultHost;
}

function generateMailHash(mailListObj) {
  return utils.encryption(JSON.stringify(mailListObj));
}

exports.bindMail = async function bindMail(data, cb, db) {
  const {app, socket} = this;

  if(!app.player) {
    debug('[MailComponent] need [PlayerComponent]');
    return;
  }
  let player = app.player.list.find(socket);
  if(!player) {
    throw '用户不存在，请检查登录状态';
  }
  let userUUID = player.uuid;

  let {address} = data;
  if(!address) {
    throw '缺少参数';
  }

  let isExists = await db.models.mail_list.existsAsync({user_uuid: userUUID, enabled: true});
  if(isExists) {
    throw '已绑定邮箱, 如需绑定新邮箱请先解绑';
  }

  // TODO: 需要对多次发起同一请求进行处理
  await db.transactionAsync(async () => {
    let mail = await db.models.mail_list.createAsync({
      user_uuid: userUUID,
      email_address: address,
      owner_id: player.user.id,
    });

    const subject = '绑定TRPG账户电子邮箱';
    const template = require('./views/validate.marko');
    const host = getHost(socket);
    const link = `http://${host}/mail/validate/_bind?` + querystring.stringify({
      user_uuid: userUUID,
      hash: generateMailHash(mail),
      email_address: mail.email_address,
    });
    const body = template.renderToString({
      title: subject,
      link,
    });

    await app.mail.sendAsync(userUUID, fromMail, mail.email_address, subject, body);
  })

  return true;
}