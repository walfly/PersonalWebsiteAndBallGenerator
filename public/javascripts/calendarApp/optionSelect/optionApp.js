// ('angular/angular.js');

var optionApp = angular.module('optionSelectApp', ['granularityScheduler', 'dayTouch']);

// service for storing selected options
optionApp.service('optionService', ['$http', function ($http) {
	var selected = {};
	selected.option;
	selected.hasSelected = false;
	this.setSelection = function (selection, day) {
		selected.option = selection;
		selected.day = day;
		selected.hasSelected = true;
	};
	this.getSelection = function () {
		return selected;
	};
	this.removeSelection = function () {
		selected.option = undefined;
		selected.hasSelected = false;
	};
	this.hasSelected = function () {
		return selected.hasSelected;
	}
}]);

// controller for week select controller
optionApp.controller('OptionSelectCtrl', [
	'$scope',
	'optionService',
	'$filter',
	'granularityService',
	'$timeout',
	'dayTouch.getCoords',
	function (scope, optionService, $filter, granularityService, $timeout, getCoords) {
	scope.mouseIn = 'none';

	var minLength = granularityService.consultationLength;

	var getElBottom = function (dayEl, selectEl) {
		return (selectEl.offset().top + selectEl.height()) - dayEl.offset().top;
	};

	var getLastOpt = function (dayEl, selectEl) {
		var bottomOfEl = getElBottom(dayEl, selectEl);
		var visualLengthConsult = (minLength/24)*dayEl.height();
		return (bottomOfEl - visualLengthConsult);
	};

	var getFirstOpt = function (dayEl, selectEl) {
		return selectEl.offset().top - dayEl.offset().top;
	};


	scope.selected = {
		identifier: 'none'
	};

	var granularity = function (elem) {
		return elem.height()/granularityService.granularity;
	};

	scope.changeMouseIn = function (daystring) {
		scope.mouseIn = daystring;
	};

	scope.makeSelection = function (e, identifier, day) {
		var id = $filter('dayOfWeekFromInt')(day.dayOfWeek);
    var parent = angular.element('#'+id);
    var pageY = getCoords.getPage(e).y;
    var location = pageY - parent.offset().top;
    var pos = $filter('nearestBlock')(location, granularity(parent));
    pos = Math.min(pos, getLastOpt(parent, angular.element(e.currentTarget)));
    pos = Math.max(pos, getFirstOpt(parent, angular.element(e.currentTarget)));
    var time = $filter('positionToTime')(pos, granularity(parent), granularityService.perHour, granularityService.MINUTESTEP);
    scope.selected.identifier = identifier;
    scope.selected.time = time;
    scope.selected.duration = (minLength/24)*parent.height();
    optionService.setSelection(time, day.date);
	};
}]);
// controller for text at the bottom
optionApp.controller('OptionSubmitCtrl', ['$scope', 'optionService', 'granularityService', function (scope, optionService, granularityService) {
	scope.selected = optionService.getSelection();
	scope.consultationLength = granularityService.consultationLength;
}]);
// the option thats been clicked on
optionApp.directive('chosenOption',['$filter', function ($filter) {
	return {
		restrict: 'A',
		link: function (scope, element, attr) {
			var id = $filter('dayOfWeekFromInt')(scope.day.dayOfWeek);
      var dayEl = angular.element('#'+id);
      var weekEl = angular.element('#week');
      var parent = element.parent();

			element.hide();

			var hourMin = function (time) {
				var hourMin = time.split(':');
				var hour = Number(hourMin[0]);
				var min = Number(hourMin[1])/60;
				hourMin = hour + min;
				return hourMin;
			};
			scope.$watch('selected', function (data) {
        dayEl = angular.element('#'+id);
				// watch controllers selected property and check if it's this selection
				if(data.identifier === (scope.day.dayString + scope.time.time)){
					var time = scope.selected.time;
					time = hourMin(time);
					time = (time/24);
					var timeScaled = time*dayEl.height();
					// the distance from the top of the day to the top of the time option
					var subAmount = parent.offset().top - dayEl.offset().top;
					element.css({'top': timeScaled - subAmount, 'height': scope.selected.duration});
					element.show();
				} else {
					element.hide();
				}
			}, true);
		}
	}
}]);

// draw the time range on the page, bind enter and leave 
optionApp.directive('option', [
	'$filter',
	'granularityService',
	'optionService',
	'dayTouch.swipeAndScroll',
	function ($filter, granularityService, optionService, swipeAndScroll) {
	return {
		restrict: 'A',
		replace: false,
		transclude: true,
		link: function (scope, element, attr){
			// use the dayofweek to find the parent element 
			var id = $filter('dayOfWeekFromInt')(scope.day.dayOfWeek);
      var parent = angular.element('#'+id);

			var getLocation = function (pageY) {
				return pageY - parent.offset().top + parent.scrollTop();
			};

			var getOptTop = function (pos) {
				return pos - element.offset().top;
			};

			var perHour = granularityService.perHour;
			var MINSTEP = granularityService.MINUTESTEP;
			var granularity = function () {
				return parent.height()/granularityService.granularity;
			};


			var positionToTime = $filter('positionToTime');
			var nearestBlock = $filter('nearestBlock');
			var timeToFloat = $filter('timeToFloat');

			var hourMin = function (time, duration) {
				var hourMin = time.split(':');
				var hour = Number(hourMin[0]);
				var min = Number(hourMin[1])/60;
				hourMin = hour + min;
				return hourMin;
			};

			var buildDiv = function (time, duration) {
				var top = (time)/24;
				var styles = {
					'top' : top * parent.height(),
					'height': (duration/24) * parent.height()
				};
				element.css(styles);
			};

			scope.$watch('time', function () {
				var time = scope.time;
				var timeNum = hourMin(time.time);
				var startTime = timeNum;
				var duration = time.duration;
				buildDiv(startTime, duration);
			}, true);

			if(!Modernizr.touch){
				element.on('mouseenter', function () {
					scope.$apply(function () {
						scope.changeMouseIn(scope.day.dayString + scope.time.time);
					});
				});

				element.on('mouseleave', function () {
					scope.$apply(function () {
						scope.changeMouseIn('none');
					});
				});

				element.on('mousedown', function (e) {
					scope.$apply(function (){
						scope.makeSelection(e, scope.day.dayString + scope.time.time, scope.day);
					})
				});
			} else {
				// set up swiping for option
				var left = function (){
					scope.goToDay(scope.day.dayOfWeek + 1);
				};
				var right = function () {
					scope.goToDay(scope.day.dayOfWeek - 1);
				};
				var after = function (e) {
					scope.$apply(function () {
						scope.makeSelection(e, scope.day.dayString + scope.time.time, scope.day);
					});
					element.on('touchmove', dragSelection);
					element.on('touchend', endTouch);
				};
				var dragSelection = function (e) {
					e.preventDefault();
					e.stopPropagation()
					scope.$apply(function () {
						scope.makeSelection(e, scope.day.dayString + scope.time.time, scope.day);
					});
				};
				var endTouch = function () {
					element.unbind('touchmove', dragSelection);
					element.unbind('touchend', endTouch);
				};
				swipeAndScroll({element:element, left: left, right: right, after: after});
			}
		}
	}
}]);

// diplays the mouse position as a time when is over selection 
optionApp.directive('optionSelect',[
	'$filter',
	'granularityService',
	'dayTouch.getCoords',
	function ($filter, granularityService, getCoords) {
	return{
		restrict: 'A',
		replace: false,
		link: function (scope, element, attr) {
			var id = $filter('dayOfWeekFromInt')(scope.day.dayOfWeek);
      var dayEl = angular.element('#'+id);
      scope.option = scope.time.time;


      var getLocation = function (pageY) {
        return pageY - dayEl.offset().top;
      };

			var getOptTop = function (pos) {
				return pos - (element.parent().offset().top - dayEl.offset().top);
			};

			var getElBottom = function () {
				var pare = element.parent();
				return (pare.offset().top + pare.height())-dayEl.offset().top;
			};

			var getLastOpt = function () {
				var bottomOfEl = getElBottom();
				var visualLengthConsult = (minLength/24)*dayEl.height();
				return (bottomOfEl - visualLengthConsult);
			};

			var granularity = function () {
				return dayEl.height()/granularityService.granularity;
			};

      var perHour = granularityService.perHour;
			var MINSTEP = granularityService.MINUTESTEP;
			var minLength = granularityService.consultationLength;
			element.height((minLength/24)*dayEl.height());



			var positionToTime = $filter('positionToTime');
			var nearestBlock = $filter('nearestBlock');
			var timeToFloat = $filter('timeToFloat');

			var mouseMoveCB = function (e) {
				var pos = getLocation(getCoords.getPage(e).y);
				if(pos > getElBottom()){
					return;
				}
				pos = nearestBlock(pos, granularity());
				pos = Math.min(pos, getLastOpt());
				var time = positionToTime(pos, granularity(), perHour, MINSTEP);
				var optTop = getOptTop(pos);
				element.css({'top': optTop});
				scope.$apply(function () {
					scope.option = time;
				});
			};

			scope.$watch('mouseIn', function (data) {
				// reassign dayEl so it doesnt lose its refference;
				if(data === (scope.day.dayString + scope.time.time)){
	      	dayEl = angular.element('#'+id);
					element.parent().on('mousemove', mouseMoveCB);
				} else {
					element.parent().unbind('mousemove');
				}
			});
		}	
	}
}]);

