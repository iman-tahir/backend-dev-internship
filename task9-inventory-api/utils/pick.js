// Copies only the allowed keys from an object
module.exports = (obj, keys) =>
  keys.reduce((result, key) => {
    if (obj[key] !== undefined) result[key] = obj[key];
    return result;
  }, {});