// sortedKeys
module.exports = function () {
  return function (obj) {
    var keys = Object.keys(obj);
    return keys.sort();
  }
};