// pastDay
module.exports = function () {
  return function (pastDay) {
    return pastDay ? "invalid-day" : "valid-day";
  };
};