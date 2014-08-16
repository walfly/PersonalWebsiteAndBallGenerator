// dayOfWeekFromInt deps weekdaysService
exports.dayofWeekFromInt = function (weekdays) {
  return function (date) {
    var day = weekdays.getDay(date);
    day = day.slice(0,3);
    day = day.charAt(0).toUpperCase() + day.slice(1);
    return day;
  };
};

// intFromDay no deps

exports.intFromDay = function () {
  return function (string) {
    var obj = {
      "mon": 0,
      "tue": 1,
      "wed": 2,
      "thu": 3,
      "fri": 4,
      "sat": 5,
      "sun": 6
    };
    return obj[string];
  };
};

