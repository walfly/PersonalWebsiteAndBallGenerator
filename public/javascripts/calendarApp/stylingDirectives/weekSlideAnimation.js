angular.module('weekSlide', []).directive('weekSlide', ['$timeout',function ($timeout) {
	return {
		restict: "A",		
		scope: {},
		link: function (scope, element, attr) {
			// add to the controller
			scope.$parent.addWeekContainer({scope:scope});
			var positionList;
			var offLeft; 
			$timeout(function () {
				// set up locations
				var elemWidth = element.find('.week-select').width() + 30;
				positionList = [0];
				for(var i = 1; i < 9; i ++){
					positionList[i] = positionList[i-1] + elemWidth;
				}
				offLeft = - elemWidth;

			});

			scope.backToZero = function () {
				element.css({left: 0});
			};
			scope.rightSetUp = function () {
				element.css({left: offLeft});
			};
			scope.animateRight = function () {
				element.animate({left: 0}, {
					duration: 200,
					complete: function () {
						scope.$parent.animateFinishRight();
					}
				});
			};
			scope.animateLeft = function (index, num) {
				element.animate({left: 0 - positionList[index]}, {
					duration: 200 * index,
					complete: function () {
						scope.$parent.animateFinishLeft(num);
					}
				});
			}
		}
	};
}]);