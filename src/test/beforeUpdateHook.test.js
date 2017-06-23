/* globals it describe beforeEach xit */
import { expect } from 'chai';
import { Sequelize, defaultLocalValues, defaultExternalizeValues, defaultAttributeMap } from './helpers';
import ExternalizeModel from '../index';
//import _ from 'lodash';

describe('update', function() {
  let Company, ExternalCompany, putExternal, postExternal, getExternal, destroyExternal, externalizeValues;

  beforeEach(async function() {

    Company = this.sequelize.define('Company', {
      name: Sequelize.STRING,
      zip: Sequelize.STRING,
      external_id: Sequelize.STRING,
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

  it('should update the remote instance then update the local instance', async () => {
    expect(await ExternalCompany.findOne({ where: { external_name: 'Company' } })).to.be.null;
    const putExternal = async (id, attributes) => await ExternalCompany.update(attributes, { where: { id }, returning: true });
    const postExternal = async (id, attributes) => await ExternalCompany.create(attributes, { returning: true });
    const getExternal = async (id) => await ExternalCompany.findById(id);

    ExternalizeModel.externalizeModel(Company, Object.assign({}, defaultExternalizeValues, { putExternal, getExternal, postExternal }));

    const company = await Company.create(defaultLocalValues);
    const updatedCompany = await company.update({name: 'Updated Company'}, { returning: true });

    expect(updatedCompany.name).to.equal('Updated Company');
  });

  it('should throw an error if no external_id is passed to putExternal', async () => {

  });

  xit('should clobber remote changes with local changes', async () => {

  });

  xit('should throw an error and not update the local instance if the remote update fails ', async () => {

  });

  xit('should delete the local instance if the remote instance cannot be found', async () => {

  });

  // BULK update
  it('should update multiple remote instances', async () => {
    ExternalizeModel.externalizeModel(Company, externalizeValues);
    await Company.create(Object.assign({}, defaultLocalValues, { name: 'CO1' }));
    await Company.create(Object.assign({}, defaultLocalValues, { name: 'CO2' }));
    await Company.create(Object.assign({}, defaultLocalValues, { name: 'CO3' }));
    const allCompanies = await ExternalCompany.findAll();
    expect(allCompanies.map(c => c.external_name)).to.eql(['CO1', 'CO2', 'CO3']);
    await Company.update({name: 'NEW'}, { where: { id: {'$gt': 0 } } });
    const allCompaniesUpdated = await ExternalCompany.findAll();
    expect(allCompaniesUpdated.map(c => c.external_name)).to.eql(['NEW', 'NEW', 'NEW']);
  });

  xit('should delete multiple remote instances if they are missing and return an array of found / updated instances or an empty array', async () => {

  });
});
