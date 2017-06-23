/* globals beforeEach */
import Sequelize from 'sequelize';
import Config from './config/config.js';
import _ from 'lodash';

Sequelize.Promise.onPossiblyUnhandledRejection((e) => { throw e; });
Sequelize.Promise.longStackTraces();

const defaultAttributeMap = {
  name: 'external_name',
  zip: 'external_zip',
  magic_number: 'magic_number',
};

const defaultLocalValues = {
  name: 'Company',
  external_id: '1',
  zip: '98117',
  magic_number: 40
};

const defaultRemoteValues = {
  id: '1',
  external_name: 'Company',
  external_zip: '98117',
  magic_number: 40,
};

const defaultExternalizeValues = {
  external_id: 'external_id',
  attributeMap: defaultAttributeMap,
  getExternal: () => defaultRemoteValues,
  putExternal: () => {},
  postExternal: () => {},
  destroyExternal: () => {},
};

const Support = {
  Sequelize: Sequelize,

  initTests: function(options) {
    this.createSequelizeInstance(options);
  },

  createSequelizeInstance: function(options = {}) {
    const config = Config[options.dialect || this.getTestDialect()];

    const sequelizeOptions = _.defaults(options, {
      host: options.host || config.host,
      logging: (process.env.SEQ_LOG ? console.log : false),
      //logging: (process.env.SEQ_LOG ? console.log : console.log),
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
  defaultAttributeMap,
  defaultLocalValues,
  defaultRemoteValues,
  defaultExternalizeValues,
};

beforeEach(function() {
  this.sequelize = Support.sequelize;
});

Support.sequelize = Support.createSequelizeInstance();
module.exports = Support;
