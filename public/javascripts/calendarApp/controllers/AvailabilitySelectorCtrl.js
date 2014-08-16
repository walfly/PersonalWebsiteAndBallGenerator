angular.module('availabilitySelectorCtrl', ['availabilityService', 'todayService', 'availabilitySelect'])
.controller('CalendarAvbCtrl',[
  '$scope',
  'availabilityService',
  'todayService',
  'selectionService',
  function ($scope, availabilityService, todayService, selectionService) {
  
  var mapSelections = function () {
    for(var i = 0; i < 7; i ++){
      $scope.selections[i] = selectionService.getDate(i); 
    }
  };
  
  $scope.availability = availabilityService.getAvailability();
  $scope.currentTime = todayService.getCurrentTime();
  $scope.spillover = [];
  $scope.week = [0,1,2,3,4,5,6];
  $scope.selections = {};
  $scope.allSelections = selectionService.getSelectedDates();
  $scope.$watch('week', mapSelections, true);
  $scope.$watchCollection('allSelections', mapSelections);

  $scope.$watchCollection('availability', function () {
    $scope.spillover = [];
  });

  $scope.passToDay = function (excess, day) {
    $scope.spillover[day] = {
      duration: excess,
      time: '0:00'
    }
  };

  $scope.nextWeek = function () {
    todayService.goToNextWeek();
  };

  $scope.previousWeek = function () {
    todayService.goToPreviousWeek();
  };

}]);