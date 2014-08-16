angular.module('scrollTo', ['todayService', 'selections'])
.directive('scrollToNine', [
	'$timeout',
	'todayService',
	function ($timeout, todayService) {
	return {
		restrict: 'A',
		link: function (scope, element, attr) {
			$timeout(function() {
				var day = element.find('.calendar-day');
				var nine = (9/24) * day.height();
				var scrollTo;
				if(element.width() < 500){
					var currentTime = todayService.getCurrentTime();
					scrollTo = currentTime.hour < 9? nine: (currentTime.hour/24) * day.height();
				} else {
					scrollTo = nine;
				}
				element.scrollTop(scrollTo);
			}, 0);
		}
	}
}])
.directive('scrollToFirst', ['selectionService', '$timeout', function (selectionService, $timeout) {
	return{
		restrict: 'A',
		link: function (scope, element, attr) {
			$timeout(function () {
				var day = element.find('.calendar-day');
				if(element.width() < 500){
					var first = selectionService.getFirstSelection();
					var hour = Number(first.time.split(':')[0]);
					var scrollTo = (hour/24) * day.height();
				}else{
					var scrollTo = (9/24) * day.height();
				}
				element.scrollTop(scrollTo);
			});
		}
	}
}]);