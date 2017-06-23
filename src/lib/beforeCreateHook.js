import utils from './utils';
const { mapAttributes } = utils;

const createRemoteInstance = async (instance, options, modelOptions) => {
  if (!instance[modelOptions.external_id]) {
    throw new Error(`CREATE: local instance ${instance.id} is missing a remote id ${modelOptions.external_id}`);
  }
  const mappedAttributes = mapAttributes(modelOptions.attributeMap, instance);
  const createdRemote = await modelOptions.postExternal(instance[modelOptions.external_id], mappedAttributes);

  if (createdRemote) {
    instance[modelOptions.external_id] = createdRemote.id;
    await instance.save({ hooks: false });
  }

  if (!createdRemote) {
    console.log('CREATE: Remote instance could not be created');
    return null;
  } else {
    return createdRemote;
  }
};

const beforeCreate = async (instance, options, fn, modelOptions) => {

  try {
    const createdInstance = await createRemoteInstance(instance, options, modelOptions);

    // If the remote version is gone, the local version is also destroyed
    if (createdInstance) {
      fn(null, createdInstance);
    } else {
      fn('CREATE: No remote version was created');
    }

  } catch (err) {
    fn(new Error(`Could not fetch remote instance ${err.stack}`));
  }

};

const beforeBulkCreate = async (instances, options, fn) => {
  options.individualHooks = true;
  fn(null);
};

export { beforeCreate, beforeBulkCreate };