import afterFind from './afterFindHook';
import { beforeUpdate, beforeBulkUpdate } from './beforeUpdateHook';
import { beforeCreate, beforeBulkCreate } from './beforeCreateHook';
import { beforeDestroy, beforeBulkDestroy } from './beforeDestroyHook';
// TODO - upsert

let ExternalizeModel = () => {};

ExternalizeModel.prototype.externalizeModel = (Model, modelOptions= {}) => {
  Model.afterFind('afterFind', (instance, instanceOptions, fn) => afterFind(instance, instanceOptions, fn, modelOptions));
  Model.beforeUpdate('beforeUpdate', (instance, instanceOptions, fn) => beforeUpdate(instance, instanceOptions, fn, modelOptions));
  Model.beforeBulkUpdate('beforeBulkUpdate', (instanceOptions, fn) => beforeBulkUpdate(instanceOptions, fn, modelOptions));
  Model.beforeCreate('beforeCreate', (instance, instanceOptions, fn) => beforeCreate(instance, instanceOptions, fn, modelOptions));
  Model.beforeBulkCreate('beforeBulkCreate', (instances, instanceOptions, fn) => beforeBulkCreate(instances, instanceOptions, fn, modelOptions));
  Model.beforeDestroy('beforeDestroy', (instance, instanceOptions, fn) => beforeDestroy(instance, instanceOptions, fn, modelOptions));
  Model.beforeBulkDestroy('beforeBulkDestroy', (instanceOptions, fn) => beforeBulkDestroy(instanceOptions, fn, modelOptions));
};

module.exports = new ExternalizeModel();
