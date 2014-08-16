// nearestBlock

module.exports = function () {
  return function (position, timeBlock) {
      var excess = position % timeBlock;
      return position - excess + timeBlock;
   };
 };