/* globals it describe beforeEach xit */
import { expect } from 'chai';
import { Sequelize, defaultLocalValues, defaultAttributeMap } from './helpers';
import ExternalizeModel from '../index';
//import _ from 'lodash';

describe('create', function() {
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

  it('should create the remote instance then create the local instance', async () => {
    expect(await ExternalCompany.findOne({ where: { external_name: 'Company' } })).to.be.null;

    const postExternal = async (id, attributes) => await ExternalCompany.create(attributes, { returning: true });
    const getExternal = async (id) => await ExternalCompany.findById(id);

    ExternalizeModel.externalizeModel(Company, Object.assign({}, externalizeValues, { postExternal, getExternal }));

    const company = await Company.create(Object.assign({}, defaultLocalValues));

    const externalCo = await ExternalCompany.findOne({ where: { external_name: 'Company' } });
    expect(externalCo.external_name).to.equal('Company');
    expect(company.external_id).to.equal(externalCo.id);

  });

  xit('should throw an error and not create the local instance if the remote create fails ', async () => {

  });

  xit('should bypass the remote create if the bypassFn is defined and returns true', async () => {
  });

  // BULK create
  it('should create multiple remote instances', async () => {
    ExternalizeModel.externalizeModel(Company, externalizeValues);
    await Company.bulkCreate([
      Object.assign({}, defaultLocalValues, { name: 'CO1' }),
      Object.assign({}, defaultLocalValues, { name: 'CO2' }),
      Object.assign({}, defaultLocalValues, { name: 'CO3' }),
    ]);
    const allCompanies = await ExternalCompany.findAll();
    expect(allCompanies.map(c => c.external_name).sort()).to.eql(['CO1', 'CO2', 'CO3']);
  });

  xit('should create multiple remote instances created instances or an empty array', async () => {

  });
});
