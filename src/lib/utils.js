import _ from 'lodash';

export default {
  compareAttributes: (attributeMap, local, external) => {
    if (!attributeMap || !_.keys(attributeMap.length)) throw new Error('No attribute map passed to compareAttributes');
    const mismatchedAttributes = _(attributeMap)
      .map((ext, loc) => external[ext] !== local[loc] ? loc: null)
      .compact().value();

    return mismatchedAttributes;
  }
};
