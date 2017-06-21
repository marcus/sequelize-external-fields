/* globals beforeEach */
import Sequelize from 'sequelize';
import Config from './config/config.js';
import _ from 'lodash';

Sequelize.Promise.onPossiblyUnhandledRejection((e) => { throw e; });
Sequelize.Promise.longStackTraces();

const Support = {
  Sequelize: Sequelize,

  initTests: function(options) {
    this.createSequelizeInstance(options);
  },

  createSequelizeInstance: function(options = {}) {
    const config = Config[options.dialect || this.getTestDialect()];

    const sequelizeOptions = _.defaults(options, {
      host: options.host || config.host,
      //logging: (process.env.seq_log ? console.log : console.log), // todo - change to false
      logging: (process.env.seq_log ? console.log : false), // todo - change to false
      dialect: options.dialect || this.getTestDialect(),
      port: options.port || process.env.SEQ_PORT || config.port,
      pool: config.pool,
      dialectOptions: options.dialectOptions || {}
    });

    return this.getSequelizeInstance(config.database, config.username, config.password, sequelizeOptions);
  },

  getSequelizeInstance: (db, user, pass, options={}) => {
    options.dialect = options.dialect || this.getTestDialect();
    return new Sequelize(db, user, pass, options);
  },

  getTestDialect: function() {
    return process.env.DIALECT || 'postgres';
  },

};

beforeEach(function() {
  this.sequelize = Support.sequelize;
});

Support.sequelize = Support.createSequelizeInstance();
module.exports = Support;
