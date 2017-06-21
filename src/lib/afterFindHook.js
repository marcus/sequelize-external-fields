import utils from './utils';
//import _ from 'lodash';
const { compareAttributes } = utils;

const compareAndUpdateInstance = async (instance, options, modelOptions) => {
  const externalData = await modelOptions.getExternal(modelOptions.external_id, instance);

  if (externalData === null) {
    console.log('Remote instance is missing. Calling destroy on the local instance');
    await instance.destroy(options);
    return null;
  }

  const conflictingAttributes = compareAttributes(modelOptions.attributeMap, instance.dataValues, externalData);

  if (conflictingAttributes.length) {
    const attrbutesToUpdate = conflictingAttributes.reduce((acc, att) => {
      acc[att] = externalData[modelOptions.attributeMap[att]];
      return acc;
    }, {});

    console.log('Updating model in the database', attrbutesToUpdate);
    return await instance.update(attrbutesToUpdate, { hooks: false });
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
        fn('Missing remote version');
      }
    } else {
      for (let i=0; i < instance.length; ++i) {
        let current = instance[i];
        updatedInstance = await compareAndUpdateInstance(current, options, modelOptions);
      }
      fn(null, updatedInstance); // TODO - does this get the updated instances?
    }
  } catch (err) {
    fn(new Error(`Could not fetch remote instance ${err}`));
  }

};
