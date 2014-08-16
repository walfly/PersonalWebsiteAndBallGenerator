calendarFiltersApp.filter('dayOfWeek', ['weekdaysService', function (weekdays) {
  return function (date) {
    var day = weekdays.getDay(date.getDay());
    day = day.slice(0,3);
    day = day.charAt(0).toUpperCase() + day.slice(1);
    return day;
  };
}]);