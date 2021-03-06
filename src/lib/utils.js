import _ from 'lodash';

export default {
  compareAttributes: (attributeMap, local, external) => {
    if (!attributeMap || !_.keys(attributeMap.length)) throw new Error('No attribute map passed to compareAttributes');
    const mismatchedAttributes = _(attributeMap)
      .map((ext, loc) => external[ext] !== local[loc] ? loc: null)
      .compact().value();

    return mismatchedAttributes;
  },

  // Returns an object with the attributes that the remote source requires mapped to use the remote names
  mapAttributes: (attributeMap, local) => {
    if (!attributeMap || !_.keys(attributeMap.length)) throw new Error('No attribute map passed to mapAttributes');
    return _(attributeMap)
      .reduce((acc, nextExt, nextLoc) => {
        acc[nextExt] = local[nextLoc];
        return acc;
      }, {});
  },

};
