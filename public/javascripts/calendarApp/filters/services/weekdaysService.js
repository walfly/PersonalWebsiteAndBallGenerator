calendarFiltersApp.service('weekdaysService', function () {
  var days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ];
  this.getDay = function(day){
    return days[(day)];
  }
})