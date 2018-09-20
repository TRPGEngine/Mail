module.exports = function List(orm, db) {
  let List = db.define('mail_list', {
    user_uuid: {type: 'text', required: true},
    email_address: {type: 'text', required: true},
    email_user: {type: 'text'},
    email_provider: {type: 'text'},
    enabled: {type: 'boolean', defaultValue: false},
    createAt: {type: 'date', time: true},
    updateAt: {type: 'date', time: true},
  }, {
    validations: {
      email_address: orm.enforce.patterns.email('该邮箱地址不合法'),
    },
    hooks: {
      beforeCreate: function(next) {
        if (!this.email_user) {
          this.email_user = this.email_address.split('@')[0]
        }
        if (!this.email_provider) {
          this.email_provider = this.email_address.split('@')[1]
        }
        if (!this.createAt) {
  				this.createAt = new Date();
  			}
        if (!this.updateAt) {
  				this.updateAt = new Date();
  			}
  			return next();
      },
      beforeSave: function(next) {
        if (!this.email_user) {
          this.email_user = this.email_address.split('@')[0]
        }
        if (!this.email_provider) {
          this.email_provider = this.email_address.split('@')[1]
        }
				this.updateAt = new Date();
        return next();
      },
    },
    methods: {

    }
  });

  let User = db.models.player_user;
  if(!!User) {
    List.hasOne('owner', User, { reverse: "mail" });
  }

  return List;
}
