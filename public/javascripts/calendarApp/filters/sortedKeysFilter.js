calendarFiltersApp.filter('sortedKeys', function () {
  return function (obj) {
    var keys = Object.keys(obj);
    return keys.sort();
  }
});