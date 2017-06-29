import utils from './utils';
//import _ from 'lodash';
const { compareAttributes } = utils;

const compareAndUpdateInstance = async (instance, options, modelOptions) => {
  if (modelOptions.bypassFn && modelOptions.bypassFn(instance)) {
    console.log('Bypassing find of ${instance.id} because bypass function was succesfully invoked');
    return true;
  }

  if (!instance[modelOptions.external_id]) {
    throw new Error(`FIND: local instance ${instance.id} is missing a remote id ${modelOptions.external_id}`);
  }
  const externalData = await modelOptions.getExternal(instance[modelOptions.external_id], instance);

  if (externalData === null) {
    console.log('FIND: Remote instance is missing. Calling destroy on the local instance');
    await instance.destroy(options);
    return null;
  }

  const conflictingAttributes = compareAttributes(modelOptions.attributeMap, instance.dataValues, externalData);

  if (conflictingAttributes.length) {
    const attrbutesToUpdate = conflictingAttributes.reduce((acc, att) => {
      acc[att] = externalData[modelOptions.attributeMap[att]];
      return acc;
    }, {});

    console.log('Updating local instance to match remote instance');
    return await instance.update(attrbutesToUpdate, { hooks: false });
  } else {
    return instance;
  }
};

export default async (instance, options, fn, modelOptions) => {
  try {
    let updatedInstance;
    if (instance && !Array.isArray(instance)) {

      updatedInstance = await compareAndUpdateInstance(instance, options, modelOptions);

      // If the remote version is gone, the local version is also destroyed
      if (updatedInstance) {
        fn(null, updatedInstance);
      } else {
        fn('FIND: Remote version was not found');
      }

    } else {

      for (let i=0; i < instance.length; ++i) {
        let current = instance[i];
        updatedInstance = await compareAndUpdateInstance(current, options, modelOptions);
      }
      fn(null, updatedInstance);

    }
  } catch (err) {
    fn(new Error(`Could not fetch remote instance ${err}`));
  }

};
