const destroyRemoteInstance = async (instance, options, modelOptions) => {
  if (!instance[modelOptions.external_id]) {
    throw new Error(`DESTROY: local instance ${instance.id} is missing a remote id ${modelOptions.external_id}`);
  }
  const destroyedRemote = await modelOptions.destroyExternal(instance[modelOptions.external_id]);

  if (!destroyedRemote) {
    console.log('DESTROY: Remote instance could not be destroyed');
    return null;
  } else {
    return destroyedRemote;
  }
};

const beforeDestroy = async (instance, options, fn, modelOptions) => {
  try {
    const destroyedInstance = await destroyRemoteInstance(instance, options, modelOptions);

    // If the remote version is gone, the local version is also destroyed
    if (destroyedInstance) {
      fn(null);
    } else {
      fn('DESTROY: No remote version was destroyed; not deleting local version');
    }
  } catch (err) {
    fn(new Error(`Could not fetch destroy instance ${err.stack}`));
  }

};

const beforeBulkDestroy = async (options, fn) => {
  options.individualHooks = true;
  fn(null);
};

export { beforeDestroy, beforeBulkDestroy };
