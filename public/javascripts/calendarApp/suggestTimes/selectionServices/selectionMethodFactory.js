// ('angular/angular.js');

angular.module('selectionMethods', ['counter']).factory('selectionMethods',[
  '$filter',
  '$http',
  'counter',
  function ($filter, $http, counter) {
  var selectedDates;

  var intFromDay = $filter('intFromDay');

  var startEnd = function (obj) {
    var start = obj.time.split(':');
    start = Number(start[0]) + (Number(start[1])/60);
    var end = start + obj.duration;
    return [start, end];
  };

  var combine = function (newest, comparison, selection, key, day) {
    var start = newest[0];
    if (newest[0] > comparison[0]){
      selectedDates[day][key].time = selection.time;
      start = comparison [0];
    }
    if (newest[1] < comparison [1]){
      selectedDates[day][key].duration = comparison[1] - start;
    } else {
      selectedDates[day][key].duration = newest[1] - start;
    }
    delete selectedDates[day][selection.created];
    return selectedDates[day][key];
  };
  var cleanUp = function (obj, key, day, selections) {
    selectedDates = selections;
    if(obj && Object.keys(obj).length > 1){
      var newSelect = obj[key];
      var newest = startEnd(newSelect);
      var comparison;
      angular.forEach(obj, function (selection) {
        if (selection !== obj[key]){
          comparison = startEnd(selection);
          if((newest[0] <= comparison[1]) && (newest[1] >= comparison[0])){
            newSelect = combine(newest, comparison, selection, key, day);
            newest = startEnd(newSelect);
          }
        }
      });
    }
    return selectedDates;
  };
  return {

    cleanUp: cleanUp,

    loadSelections: function (data) {
      var retObj = {};
      var daysBeingUpdated = {}
      angular.forEach(data, function (times, day) {
        var intDay = intFromDay(day);
        retObj[intDay] = {}
        angular.forEach(times, function (time){
          time.date = intDay;
          time.created = counter.getCount();
          retObj[intDay][time.created] = time;
          daysBeingUpdated[intDay] = { 
                            'day' : intDay,
                            'time' : time.created 
                          };
          angular.forEach(daysBeingUpdated, function (day) {
            retObj = cleanUp(retObj[day.day], day.time, day.day, retObj);
          });
        });
      });
      return retObj;
    }

  }
}]);