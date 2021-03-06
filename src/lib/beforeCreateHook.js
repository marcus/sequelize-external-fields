import utils from './utils';
const { mapAttributes } = utils;

const createRemoteInstance = async (instance, options, modelOptions) => {
  if (modelOptions.bypassFn && modelOptions.bypassFn(instance)) {
    console.log('Bypassing create because bypass function was succesfully invoked');
    return true;
  }

  const mappedAttributes = mapAttributes(modelOptions.attributeMap, instance);
  const createdRemote = await modelOptions.postExternal(mappedAttributes, instance);

  if (createdRemote && createdRemote.id) {
    instance[modelOptions.external_id] = createdRemote.id;
    await instance.save({ hooks: false });
    return createdRemote;
  } else {
    console.log('CREATE: Remote instance could not be created');
    return null;
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
