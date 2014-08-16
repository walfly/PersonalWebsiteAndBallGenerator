angular.module('availabilityService', ['todayService']).service('availabilityService', ['$http', 'todayService', '$filter', '$rootScope', function ($http, todayService, $filter, rootScope) {

  var availability = window.availability;
  var TIMEBUFFER = 1;

  var dayToInt = $filter('intFromDay');

  var loadAvailibility = function () {

  };
  
  this.changeTimezone = function () {
    $http({url:"/api/expert/timezone.json", method: "GET", params: {expert: 168, timezone: "Asia/Rangoon"}})
      .success(function (data) {
        if(data.success === 'success'){
          angular.forEach(availability, function (arr) {
            arr.length = 0;
          });
          angular.forEach(data.data.availability, function (item, key) {
            var index = dayToInt(key);
            availability[index] = item;
          });
          var currentTime = todayService.changeCurrentTime(data.data.currentTime);
          var timeSelection = new Date(currentTime);
          var currentTimeFloat = data.data.currentTime.split('T')[1].split(':');
          currentTimeFloat = Number(currentTimeFloat[0]) + (Number(currentTimeFloat[1])/60);
          timeSelection.setHours(currentTime.getHours() + offset);
          $rootScope.$broadCast('timezoneChange', timeSelection, currentTimeFloat);
        }
      });
  };

  this.getAvailability = function () {
    return availability ? availability : loadAvailibility();
  };

  this.switchCurrentTime = function () {
    var temp = currentTime;
    currentTime = newTime;
    newTime = temp;
    time.hour= currentTime.getHours();
    time.min= currentTime.getMinutes();
  };

  this.switchAvailability = function () {
    var temp = availability[5];
    availability[5] = newAvailability;
    newAvailability = temp;
  };
}]);