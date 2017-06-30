/* globals it describe beforeEach xit */
import { expect } from 'chai';
import { Sequelize, defaultLocalValues, defaultRemoteValues, defaultAttributeMap } from './helpers';
import ExternalizeModel from '../index';

describe('find', function() {
  let Company, ExternalCompany, putExternal, postExternal, getExternal, externalizeValues;

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
    postExternal = async (attributes) => await ExternalCompany.create(attributes, { returning: true });
    getExternal = async (id) => await ExternalCompany.findById(id);

    externalizeValues = {
      external_id: 'external_id',
      attributeMap: defaultAttributeMap,
      putExternal,
      postExternal,
      getExternal,
    };

    await this.sequelize.sync({force: true});
  });

  it('should run the hooks', async () => {
    ExternalizeModel.externalizeModel(Company, externalizeValues);
    await Company.create(defaultLocalValues);
    const company = await Company.find({ where: { name: 'Company' } });
    expect(company.name).to.equal('Company');
  });

  it('should return an error if the beforeFind hook fails', async () => {
    ExternalizeModel.externalizeModel(Company,
      Object.assign({}, externalizeValues, { getExternal: () => { throw new Error('Bad remote call'); } })
    );
    await Company.create(defaultLocalValues);
    try {
      expect(await Company.find({ where: { name: 'Company' } })).to.throw(/remote/);
    } catch (err) {};

  });

  // AFTER find
  it('should return the local instance if it is the same as the remote version', async () => {
    ExternalizeModel.externalizeModel(Company, externalizeValues);
    await Company.create(defaultLocalValues);
    const company = await Company.find({ where: { name: 'Company' } });
    expect(company.external_id).to.equal(1);
  });

  it('should update the local instance if the remote version is different from the local version', async () => {
    ExternalizeModel.externalizeModel(Company,
      Object.assign({}, externalizeValues, {
        getExternal: () => Object.assign({}, defaultRemoteValues, { external_name: 'CompanyNameUpdated' })
      })
    );
    await Company.create(defaultLocalValues);
    const company = await Company.find({ where: { name: 'Company' } });
    // The find discovers the remote value is different and updates the local value to match
    expect(company.name).to.equal('CompanyNameUpdated');
  });

  it('should fetch a remote attribute async', async() => {
    ExternalizeModel.externalizeModel(Company,
      Object.assign({}, externalizeValues, {
        getExternal: () => {
          return new Promise(resolve => resolve(Object.assign({}, defaultRemoteValues, { external_name: 'CompanyNameUpdated2' })));
        }
      })
    );

    await Company.create(defaultLocalValues);

    const company = await Company.find({ where: { name: 'Company' } });
    expect(company.name).to.equal('CompanyNameUpdated2');

  });

  it('should delete the local instance if the remote equivalent is not found', async () => {
    ExternalizeModel.externalizeModel(Company,
      Object.assign({}, externalizeValues, { getExternal: () => null })
    );

    await Company.create(Object.assign({}, defaultLocalValues, { external_id: 5, name: 'Remote Deleted Company'  }));

    try {
      expect(await Company.find({ where: { external_id: 5 } })).to.throw(/remote/);
    } catch (err) {};

  });

  xit('should bypass the remote find if the bypassFn is defined and returns true', async () => {
  });

  // After bulk find
  it('should update all local instances if the remote versions are different from the local version', async () => {
    ExternalizeModel.externalizeModel(Company,
      Object.assign({}, externalizeValues, {
        getExternal: (ex_id, instance) => Object.assign({}, defaultRemoteValues, { id: ex_id, external_name: `CompanyNameUpdated ${instance.id}` })
      })
    );

    await Company.create(Object.assign({}, defaultLocalValues, { external_id: 1, name: 'Uno' }));
    await Company.create(Object.assign({}, defaultLocalValues, { external_id: 2, name: 'Dos' }));

    const companies = await Company.findAll();
    expect(companies.map(c => c.name)).to.eql(['CompanyNameUpdated 1', 'CompanyNameUpdated 2']);
  });

  it('should return the local instances that are the same as the remote version', async () => {
    ExternalizeModel.externalizeModel(Company, Object.assign({}, externalizeValues));

    const c1 = await Company.create(Object.assign({}, defaultLocalValues, { name: 'CompanyName 1' }));
    const c2 = await Company.create(Object.assign({}, defaultLocalValues, { name: 'CompanyName 2' }));

    // Verify the external models exist with the same names as the local models
    const e1 = await ExternalCompany.findOne({hooks: false, where: { id: c1.external_id } });
    const e2 = await ExternalCompany.findOne({hooks: false, where: { id: c2.external_id } });
    expect(e1.external_name).to.equal('CompanyName 1');
    expect(e2.external_name).to.equal('CompanyName 2');

    await ExternalCompany.update({external_name: 'CompanyName 3'}, { where: { id: c1.id }});
    await ExternalCompany.update({external_name: 'CompanyName 4'}, { where: { id: c2.id }});

    const e1b = await ExternalCompany.findOne({hooks: false, where: { id: c1.external_id } });
    const e2b = await ExternalCompany.findOne({hooks: false, where: { id: c2.external_id } });
    expect(e1b.external_name).to.equal('CompanyName 3');
    expect(e2b.external_name).to.equal('CompanyName 4');

    const companies = await Company.findAll();
    expect(companies.map(c => c.name)).to.eql(['CompanyName 3', 'CompanyName 4']);
  });

  xit('it should delete all missing remote instances and return an array of found remote instances', async () => {

  });

  // Associations / joins
  xit('it should run hooks for associations', async () => {

  });

});
