calendarFiltersApp.filter('pastDay', function () {
  return function (pastDay) {
    return pastDay ? "invalid-day" : "valid-day";
  };
});