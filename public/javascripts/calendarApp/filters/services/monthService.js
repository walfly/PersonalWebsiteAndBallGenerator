calendarFiltersApp.service('monthService', function () {
  var months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'
  ];
  this.getMonth = function (monthIndex) {
    return months[monthIndex];
  };
  this.getDaysInMonth = function (monthIndex) {
    var date = new Date();
    date.setMonth(monthIndex + 1);
    date.setDate(0);
    return date.getDate();
  };
})