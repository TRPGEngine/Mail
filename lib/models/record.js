module.exports = function Record(orm, db) {
  let Record = db.define('mail_record', {
    user_uuid: {type: 'text', required: true},
    from: {type: 'text', required: true},
    to: {type: 'text', required: true},
    subject: {type: 'text', required: true},
    body: {type: 'text', big: true},
    host: {type: 'text', required: true},
    port: {type: 'text', required: true},
    secure: {type: 'boolean', defaultValue: true},
    is_success: {type: 'boolean', defaultValue: true},
    data: {type: 'object'},
    error: {type: 'text', size: 1000},
    createAt: {type: 'date', time: true},
  }, {
    validations: {
      email_address: orm.enforce.patterns.email('该邮箱地址不合法'),
    },
    hooks: {
      beforeCreate: function(next) {
        if (!this.createAt) {
  				this.createAt = new Date();
  			}
  			return next();
      },
    },
    methods: {

    }
  });

  return Record;
}
