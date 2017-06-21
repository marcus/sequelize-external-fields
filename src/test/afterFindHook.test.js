/* globals it describe beforeEach */
import { expect } from 'chai';
import { Sequelize } from './helpers';
import ExternalizeModel from '../index';

describe('find', function() {
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
    postExternal: () => {},
  };

  let Company;

  beforeEach(async function() {

    Company = this.sequelize.define('Company', {
      name: Sequelize.STRING,
      zip: Sequelize.STRING,
      external_id: Sequelize.STRING,
      magic_number: Sequelize.INTEGER,
    });

    await this.sequelize.sync({force: true});
  });

  it('should run the hooks', async () => {
    ExternalizeModel.externalizeModel(Company, defaultExternalizeValues);
    await Company.create(defaultLocalValues);
    const company = await Company.find({ where: { name: 'Company' } });
    // TODO - sinon to check that the hook is called
    expect(company.name).to.equal('Company');
  });

  it('should return an error if the beforeFind hook fails', async () => {
    ExternalizeModel.externalizeModel(Company,
      Object.assign({}, defaultExternalizeValues, { getExternal: () => { throw new Error('Bad remote call'); } })
    );
    await Company.create(defaultLocalValues);
    try {
      expect(await Company.find({ where: { name: 'Company' } })).to.throw(/remote/);
    } catch (err) {};

  });

  // AFTER find
  it('should return the local model if it is the same as the remote version', async () => {
    ExternalizeModel.externalizeModel(Company, defaultExternalizeValues);
    await Company.create(defaultLocalValues);
    const company = await Company.find({ where: { name: 'Company' } });
    expect(company.external_id).to.equal('1');
  });

  it('should update the local model if the remote version is different from the local version', async () => {
    ExternalizeModel.externalizeModel(Company,
      Object.assign({}, defaultExternalizeValues, {
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
      Object.assign({}, defaultExternalizeValues, {
        getExternal: () => {
          return new Promise(resolve => resolve(Object.assign({}, defaultRemoteValues, { external_name: 'CompanyNameUpdated2' })));
        }
      })
    );

    await Company.create(defaultLocalValues);

    const company = await Company.find({ where: { name: 'Company' } });
    expect(company.name).to.equal('CompanyNameUpdated2');

  });

  // After bulk find
  it('should update all local models if the remote versions are different from the local version', async () => {
    ExternalizeModel.externalizeModel(Company,
      Object.assign({}, defaultExternalizeValues, {
        getExternal: (ex_id, instance) => Object.assign({}, defaultRemoteValues, { id: ex_id, external_name: `CompanyNameUpdated ${instance.id}` })
      })
    );

    await Company.create(Object.assign({}, defaultLocalValues, { external_id: 1, name: 'Uno' }));
    await Company.create(Object.assign({}, defaultLocalValues, { external_id: 2, name: 'Dos' }));

    const companies = await Company.findAll();
    expect(companies.map(c => c.name)).to.eql(['CompanyNameUpdated 1', 'CompanyNameUpdated 2']);
  });

  it('should return the local models that are the same as the remote version', async () => {
    ExternalizeModel.externalizeModel(Company,
      Object.assign({}, defaultExternalizeValues, {
        getExternal: (ex_id, instance) => Object.assign({}, defaultRemoteValues, { id: ex_id, external_name: `CompanyNameUpdated ${instance.external_id}` })
      })
    );

    await Company.create(Object.assign({}, defaultLocalValues, { external_id: 3, name: 'CompanyNameUpdated 3' }));
    await Company.create(Object.assign({}, defaultLocalValues, { external_id: 4, name: 'CompanyNameUpdated 4' }));

    const companies = await Company.findAll();
    expect(companies.map(c => c.name)).to.eql(['CompanyNameUpdated 3', 'CompanyNameUpdated 4']);

  });

  it.only('should delete the local model if the remote equivalent is not found', async () => {
    ExternalizeModel.externalizeModel(Company,
      Object.assign({}, defaultExternalizeValues, { getExternal: () => null })
    );

    await Company.create(Object.assign({}, defaultLocalValues, { external_id: 5, name: 'Remote Deleted Company'  }));

    try {
      expect(await Company.find({ where: { external_id: '5' } })).to.throw(/remote/);
    } catch (err) {};

  });


});
