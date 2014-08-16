// ('angular/angular.js');

angular.module('availabilitySelect', ['selectionMethods']).service('selectionService', [
  '$rootScope',
  '$http',
  '$timeout',
  'expertData',
  'selectionMethods',
  function ($rootScope, $http, $timeout, expertData, selectionMethods) {
  var selectedDates = {};
  var daysBeingUpdated = {};

  var cleanUp = selectionMethods.cleanUp;

  var getKey = function (date) {
    return date;
  };

  selectedDates = selectionMethods.loadSelections(window.availability);
  window.availability = undefined;

  var addDate = function (date) {
      var key = getKey(date.date);
      if(selectedDates[key]){
        selectedDates[key][date.created] = date;
      } else {
        selectedDates[key] = {};
        selectedDates[key][date.created] = date;
      }
      daysBeingUpdated[key] = { 
                                'day' : key,
                                'time' : date.created 
                              };  
  }

  this.addDate = function (date) {
    // $timeout places the callback function in the next digest loop without interacting with the current loop
    $timeout(function() {
      addDate(date);
    });
  };

  this.addDates = function (arr) {
    $timeout(function(){
      angular.forEach(arr, function(date){
        addDate(date);
      });
    });
  };

  this.mouseUpEvent = function () {
    $timeout(function () {
      angular.forEach(daysBeingUpdated, function (day) {
        selectedDates = cleanUp(selectedDates[day.day], day.time, day.day, selectedDates);
      });
      daysBeingUpdated = {};
    });
  };

  this.removeDate = function (date){
    $timeout(function() {
      var key = getKey(date.date);
      if(selectedDates[key]){
        if(selectedDates[key][date.created]){
          delete selectedDates[key][date.created];
        }
      }
      // delete the whole bucket if its empy
      if(selectedDates[key] && !Object.keys(selectedDates[key]).length){
        delete selectedDates[key];
      }
    });
  };

  this.getDate = function (date) {
    return selectedDates[date] ? selectedDates[date] : {};
  };

  this.getSelectedDates = function () {
    return selectedDates;
  };

  this.save = function () {
    var model = {};
    model.availability = {};
    angular.forEach(selectedDates, function (dates, day) {
      model.availability[day] = [];
      angular.forEach(dates, function (date) {
        model.availability[day].push(date);
      });
    });
    model.expertid = expertData.getExpertId();
    model.timezone = expertData.getExpertTz();
    $http.post('/api/expert/availability.json',model)
    .success(function (data) {})
    .error(function (data) {});
  };

}]);