// toArray
module.exports = function () {
  return function (obj) {
    var arr = [];
    angular.forEach(obj, function (item) {
      arr.push(item);
    });
    return arr;
  }
};