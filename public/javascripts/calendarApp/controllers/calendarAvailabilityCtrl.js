// ('angular/angular.js');

angular.module('CalendarAvb', [
	'availabilityService', 
	'todayService', 
	'selections',
	'evTimezone']).controller('CalendarAvbCtrl',[
	'$scope',
	'$rootScope',
	'availabilityService', 
	'todayService', 
	'selectionService',
	'$window',
	'evTimezone.timezoneService',
	function ($scope, $rootScope, availabilityService, todayService, selectionService, $window, tzService) {
	
		$scope.availability = availabilityService.getAvailability();
		$scope.currentTime = todayService.getCurrentTime();
		$scope.spillover = [];
		$scope.week = todayService.getDateWeek();
		$scope.selections = selectionService.getSelectedDates();

		tzService.getTimezones();


		$scope.$watchCollection('availability', function () {
			$scope.spillover = [];
		});

		$scope.passToDay = function (excess, day) {
			$scope.spillover[day] = {
				duration: excess,
				time: '0:00'
			}
		};

		//displaying only one day for mobile views

		$scope.mobileDayControl = {
			isMobile: false,
			dayShowing: 0
		};

		var handleWindowSize = function () {
			if(angular.element($window).width() < 500){
				$scope.mobileDayControl.isMobile = true;
			};			
		};

		handleWindowSize();

		$scope.goToDay = function (index) {
			if(index < 0){
				$rootScope.$broadcast('goToPreviousWeek');
				$scope.mobileDayControl.dayShowing = 6;
			} else if (index > 6) {
				$rootScope.$broadcast('goToNextWeek');
				$scope.mobileDayControl.dayShowing = 0;
			} else {
				$scope.mobileDayControl.dayShowing = index;
			}
		};

		if($scope.mobileDayControl.isMobile){
			$scope.goToDay(todayService.getDayOfWeek());
		}
		
		angular.element($window).on('resize', handleWindowSize);


}]);