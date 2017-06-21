//import afterCreate from './afterCreateHook';
//import afterDestroy from './afterDestroyHook';

import afterFind from './afterFindHook';
//import afterUpdate from './afterUpdateHook';

let ExternalizeModel = () => {};

ExternalizeModel.prototype.externalizeModel = (Model, modelOptions= {}) => {
  Model.afterFind('afterFind', (instance, instanceOptions, fn) => afterFind(instance, instanceOptions, fn, modelOptions));
};

module.exports = new ExternalizeModel();
