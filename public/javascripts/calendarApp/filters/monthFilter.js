// month deps monthService

module.exports = function (monthService) {
  return function (date) {
    var month = monthService.getMonth(date);
    return month.charAt(0).toUpperCase() + month.slice(1);
  };
};