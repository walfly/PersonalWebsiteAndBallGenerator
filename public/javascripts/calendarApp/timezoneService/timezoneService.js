angular.module('evTimezone', [])
	.service('evTimezone.timezoneService', [
		'$http', 
		function ($http) {
			var timezones;
			var tzPromise;

			var loadTimezones = function () {
				return $http({url:"/api/timezones.json", method:"GET"});
			};

			this.getTimezones = function () {
				if(timezones){
					return timezones;
				} else if (tzPromise) {
					// tzPromise.succes
				}

			}
		}
	])
	.controller('evTimezone.timezoneCtrl', ['evTimezone.timezoneService', function (tzService) {

	}]);