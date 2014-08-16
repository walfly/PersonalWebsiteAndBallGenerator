calendarFiltersApp.filter('dayOfMonth', function () {
  return function (date) {
    return date.getDate();
  };
});