suggestTimeApp.directive('day', [
	'todayService',
	'counter',
	'$rootScope',
	'$timeout',
	'dayTouch.getCoords',
	'dayTouch.swipeAndScroll',
	function (todayService, counter, $rootScope, $timeout, getCoords, swipeAndScroll) {
	return {
		require: '^week',
		transclude: true,
		restrict: 'A',
		scope:{
			day: '=day'
		},
		link: function (scope, element, attrs, weekCtrl) {
			// register the day scope with week controller
			weekCtrl.addDay(scope);

			// deal with format descripency for availability picker
			var isDayNumber = typeof scope.day === "number";

			if(!isDayNumber){
					var weekDay = scope.day.dayOfWeek;
			} else {
					var weekDay = scope.day;
			}

			// return smallest unit in px
			var timeBlock = function () {
				return element.height()/weekCtrl.granularity;
			};
			// return one hour in px
	    var hourGranularity = function () {
        return parent.height()/24;
      };

      // flag for touch events
      var TOUCH_ENABLED = Modernizr.touch;

      // constants for math
			var perHour = weekCtrl.perHour;
			var MINSTEP = weekCtrl.MINSTEP;
			var minLength = weekCtrl.minLength;

			// the scrollable week div
			var weekContainer = element.parent();
			//flag for prevent adding times in the past whe day is today
			var earliestTime = 0;

			var	currentSelection = {};
			// set earliest time when day is today
			scope.$watch('day.isToday', function (data) {
				if(data){
					var time = todayService.getCurrentTime();
					var endHour = time.hour * (timeBlock() * perHour);
					var endMin = Math.ceil(time.min/MINSTEP) * timeBlock();
					earliestTime = (endHour + endMin);
				} else {
					earliestTime = 0;
				}
			});

			// rounds input to neares block based on calendar granularity
			var nearestBlock = function (selection) {
				var excess = selection % timeBlock();
				return selection - excess;
			};

			// converts a mouse position to sting time
			var positionToTime = function (position) {
				var granualStep = position/timeBlock();
				var min = (granualStep % perHour) * MINSTEP;
				var min = Math.round(min);
				if (min < 10){
					min = "0" + min;
				}
				var hours = Math.floor(granualStep/perHour);
				return "" + hours + ":" + min;
			};

			// builds the starttime and duration of the selection object
			var convertToTimeDuration = function (location) {
				var currentPosition = location;
				var start = Math.min(nearestBlock(currentPosition), currentSelection.startPoint);
				start = Math.min(start, element.height() - (minLength/24)*element.height());
				start = Math.max(earliestTime, start);
				var end = Math.max(currentPosition, currentSelection.startPoint);
				end = Math.min(element.height(), end);
				var time = {};
				time.date = isDayNumber ? weekDay: scope.day.date;
				time.time = positionToTime(start);
				var duration = end - start;
				var remainder = duration % timeBlock();
				duration = (end === element.height()) ? duration: duration - remainder + (timeBlock());
				time.duration = (duration/timeBlock());
				time.duration = Math.max((time.duration/perHour), minLength);
				return time;
			};

			// if mouse leaves the day it removes itself from the selection service
			scope.unsubscribe = function () {
				if (currentSelection.selection) {
					weekCtrl.removeSelection(currentSelection.selection);
				}
			};

			// binds the mouse enter event on all days after first click for mouse interface
			scope.bindDayEvents = function (startTime, type) {
				if (!scope.day.hasPast) {
					if(type === 'mouse'){
						element.unbind('mousedown');
						element.on('mouseenter', mouseEnter);
					}
					currentSelection.startPoint = startTime;
				}
			};

			// adds the new selecting on subscribes the day
			var mouseEnter = function (e) {
				e.preventDefault();

				var pageY = getCoords.getPage(e).y;

				var time = convertToTimeDuration(weekCtrl.getLocation(pageY));

				if(!currentSelection.selection){
					time.created = counter.getCount();
					currentSelection.selection = time;
					currentSelection.selection.date = isDayNumber ? weekDay: scope.day.date;
				} else {
					currentSelection.time = time.time;
					currentSelection.duration = time.duration;
				}

				weekCtrl.addSelection(currentSelection.selection);
				weekCtrl.addEntered(weekDay);
			};

			// called by week controller returns the new selection object
			scope.mouseMove = function (location) {
				var time = convertToTimeDuration(location);
				if(!currentSelection.selection){
					time.created = counter.getCount();
					currentSelection.selection = time;
					currentSelection.selection.date = isDayNumber ? weekDay: scope.day.date;
				} else {
					currentSelection.selection.time = time.time;
					currentSelection.selection.duration = time.duration; 
				}
				return currentSelection.selection;
			};

			// if returning to the first day clicked just runs the addentered function to update subscriptioins
			var clickedMouseEnter = function (e) {
				e.preventDefault();
				weekCtrl.addEntered(weekDay);
			};

			// initila event for mouse interface
			var mouseDown = function (e) {
				e.preventDefault();
				e.stopPropagation();
				// do nothing if invalid time
				if(scope.day.hasPast){
					return;
				}
				// do nothing if left click
				if(e.which !== 1){
          return;
        }
				var clickPosition = weekCtrl.getLocation(e.pageY);
				if(clickPosition < earliestTime){
					return;
				}
				element.unbind('mousedown');
				element.on('mouseenter', clickedMouseEnter);
				createCurrentSelection(clickPosition, 'mouse');
			};

			// builds a selection and starts the creation event bindings
			var createCurrentSelection = function (clickPosition, type) {
				currentSelection.startPoint = nearestBlock(clickPosition);
				currentSelection.startPoint = Math.min(currentSelection.startPoint, element.height() - (minLength/24)*element.height());
				var time = {};
				time.time = positionToTime(currentSelection.startPoint);
				time.created = counter.getCount();
				time.duration = minLength;
				time.date = isDayNumber ? weekDay: scope.day.date;
				// add the selection
				weekCtrl.addSelection(time);
				currentSelection.selection = time;
				// alerts all the other days
				weekCtrl.onDayMouseDown(weekDay, currentSelection.startPoint, type);
				$rootScope.$broadcast('calendarChange');
			};


			scope.mouseUp = function (location) {
				// add the final selection
				if(currentSelection.appended){
					var time = convertToTimeDuration(location);
					weekCtrl.addSelection(time);
				}
				// reset state
				currentSelection = {};
				element.unbind('mouseenter');
				if(!TOUCH_ENABLED){
					element.on('mousedown', mouseDown);
				}
			};

			// touch interface
			if(TOUCH_ENABLED){

				var right = function (e) {
					scope.$parent.goToDay(weekDay - 1);
				};
				var left = function (e) {
					scope.$parent.goToDay(weekDay + 1);
				};
				var after = function (e) {
					if(scope.day.hasPast){
						return;
					}

					var pageY = getCoords.getPage(e).y;
					var clickPosition = weekCtrl.getLocation(pageY);

					if(clickPosition < earliestTime){
						return;
					} else {
						createCurrentSelection(clickPosition, 'touch');
					}
						
				};
				// pass partially completed functions
				// set up touch events
        if(angular.element('.week-container').width() < 500){
          swipeAndScroll({element: element, right: right, left: left, after: after});
        } else {
          swipeAndScroll({element: element, after: after});
        }
			} else {
				element.on('mousedown', mouseDown);
			}

		}
	}
}])