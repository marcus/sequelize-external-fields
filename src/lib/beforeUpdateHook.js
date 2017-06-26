import utils from './utils';
const { mapAttributes } = utils;

const updateRemoteInstance = async (instance, options, modelOptions) => {
  if (!instance[modelOptions.external_id]) {
    throw new Error(`UPDATE: local instance ${instance.id} is missing a remote id ${modelOptions.external_id}`);
  }
  const mappedAttributes = mapAttributes(modelOptions.attributeMap, instance);
  const updatedRemote = await modelOptions.putExternal(instance[modelOptions.external_id], mappedAttributes, instance);

  if (!updatedRemote) {
    console.log('UPDATE: Remote instance is missing. Calling destroy on the local instance');
    await instance.destroy(options);
    return null;
  } else {
    return updatedRemote;
  }
};

const beforeUpdate = async (instance, options, fn, modelOptions) => {

  try {
    const updatedInstance = await updateRemoteInstance(instance, options, modelOptions);

    // If the remote version is gone, the local version is also destroyed
    if (updatedInstance) {
      fn(null, updatedInstance);
    } else {
      fn('Missing remote version');
    }

  } catch (err) {
    fn(new Error(`Could not fetch remote instance ${err}`));
  }

};

const beforeBulkUpdate = async (options, fn) => {
  options.individualHooks = true;
  fn(null);
};

export { beforeUpdate, beforeBulkUpdate };
