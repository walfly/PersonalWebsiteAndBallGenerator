// monthAbbr deps monthService
module.exports = function (monthService) {
  return function (date) {
    var index = date.getMonth();
    var month = monthService.getMonth(index);
    month = index === 8 ? month.slice(0,4): month.slice(0,3);
    month = month.charAt(0).toUpperCase() + month.slice(1);
    return month;
  };
};