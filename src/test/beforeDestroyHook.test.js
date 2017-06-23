/* globals it describe beforeEach xit */
import { expect } from 'chai';
import { Sequelize, defaultLocalValues, defaultAttributeMap } from './helpers';
import ExternalizeModel from '../index';
//import _ from 'lodash';

describe('destroy', function() {
  let Company, ExternalCompany, putExternal, postExternal, getExternal, destroyExternal, externalizeValues;

  beforeEach(async function() {

    Company = this.sequelize.define('Company', {
      name: Sequelize.STRING,
      zip: Sequelize.STRING,
      external_id: Sequelize.INTEGER,
      magic_number: Sequelize.INTEGER,
    });

    ExternalCompany = this.sequelize.define('ExternalCompany', {
      external_name: Sequelize.STRING,
      external_zip: Sequelize.STRING,
      magic_number: Sequelize.INTEGER,
    });

    putExternal = async (id, attributes) => await ExternalCompany.update(attributes, { where: { id }, returning: true });
    postExternal = async (id, attributes) => await ExternalCompany.create(attributes, { returning: true });
    getExternal = async (id) => await ExternalCompany.findById(id);
    destroyExternal = async (id) => {
      await ExternalCompany.destroy({ where:{ id }});
      return true;
    };

    externalizeValues = {
      external_id: 'external_id',
      attributeMap: defaultAttributeMap,
      putExternal,
      postExternal,
      getExternal,
      destroyExternal,
    };

    await this.sequelize.sync({force: true});
  });

  it('should destroy the remote instance then destroy the local instance', async () => {
    ExternalizeModel.externalizeModel(Company, externalizeValues);
    const company = await Company.create(defaultLocalValues);
    const e1 = await ExternalCompany.findOne({ where: { id: company.external_id } });
    expect(e1.id).to.equal(company.external_id);
    await company.destroy();
    const e1b = await ExternalCompany.findOne({ where: { id: company.external_id } });
    expect(e1b).to.be.null;
  });

  it('should throw an error if no external_id is passed to destroyExternal', async () => {

  });

  xit('should throw an error and not destroy the local instance if the remote destroy fails ', async () => {

  });

  // BULK destroy
  it('should destroy remote instances', async () => {
    ExternalizeModel.externalizeModel(Company, externalizeValues);
    await Company.create(defaultLocalValues);
    await Company.create(Object.assign({}, defaultLocalValues, { name: 'CO2' }));
    await Company.create(Object.assign({}, defaultLocalValues, { name: 'CO2' }));
    const allCompanies = await ExternalCompany.findAll();
    expect(allCompanies.length).to.equal(3);
    await Company.destroy({ where: { id: {'$gt': 0 } } });
    const allCompaniesAfter = await ExternalCompany.findAll();
    expect(allCompaniesAfter.length).to.equal(0);
  });
});
