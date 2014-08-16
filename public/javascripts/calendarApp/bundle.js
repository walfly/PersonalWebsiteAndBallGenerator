(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
angular.module('backboneHook', []).directive('backboneHook', function () {
	return {
		controller: ['$scope', '$element', '$timeout', function ($scope, element, $timeout) {
			$scope.bbState = {
				display: false,
				suggest: true
			};
			angular.element(document).on('bbLoaded',function () {
				var bbApp = window.app.ctrl;
				if (bbApp){
					bbApp.on('calStateChange', function (data) {
						$timeout(function() {
							$scope.bbState.suggest = ! $scope.bbState.suggest
							$scope.$broadcast('changeCalFunctionality', {suggest: $scope.bbState.suggest});
						});
					});
					bbApp.on('calDisplayChange', function (data) {
						$scope.bbState.display = ! $scope.bbState.display;
						if($scope.bbState.display){
							element.show();
						} else {
							element.hide();
						}
					});
				}
			});
		}]
	}
});
},{}],3:[function(require,module,exports){
angular.module('evTotalTimes',['selections']).controller('evTotalTimes.Ctrl', [
	'$scope',
	'selectionService',
	function ($scope, selections) {
		$scope.selections = selections.getSelectedContainer(); 
}]);
},{}],4:[function(require,module,exports){
angular.module('evWeekNav', ['todayService', 'selections'])
.controller('WeekNavCtrl', [
  '$scope',
  'todayService',
  'selectionService',
  '$timeout',
  function ($scope, todayService, selectionService, $timeout) {
  // current week
  $scope.week = todayService.getDateWeek();
  // number of selections outside of bound
  $scope.bounds = {above:0, below:0, end: 2};
  // list of weeks for rendering
  $scope.weeklist = [];
  // push first week on intialize
  // for slide animations
  $scope.animateInfo = {
    direction: '',
    clicked : 0
  };


  var populateWeekList = function (firstWeek) {
    $scope.weeklist.length = 0;
    $scope.weeklist.push({
      start: firstWeek[0].date,
      end: firstWeek[6].date,
      week: firstWeek,
      count: selectionService.getWeekTotal(firstWeek)
    });
    for(var i = 0; i < 3; i ++){
      addToWeekList($scope.weeklist, 'push');
    };

    // set up initial bounds
    updateBounds($scope.weeklist[0].start, $scope.weeklist[$scope.bounds.end].end);
  };

  // adds the next of previous week
  var addToWeekList = function (list, side) {
    var week, date, count;
    var i = (side === 'push')? list.length - 1: 0;
    var offset =  (side === 'push')? 1: (-8);
    date = new Date(list[i].end.getTime());
    date.setDate(date.getDate() + offset);
    week = todayService.createWeek(date);
    count = selectionService.getWeekTotal(week);
    list[side]({
      start: week[0].date,
      end: week[6].date,
      week: week,
      count: count
    });
  };

  var updateBounds = function (low, high) {
    var bounds = selectionService.getOutBounds(low, high)
    $scope.bounds.above = bounds.above;
    $scope.bounds.below = bounds.below;
  };

  populateWeekList($scope.week);
// when cal state changes goto the first week with a selection
  $scope.$watch('bbState.suggest', function (data){
    if(!data){
      var firstSel = selectionService.getFirstSelection();
      if(firstSel){
        var week = todayService.goToWeek(selectionService.getFirstSelection().date);
        populateWeekList(week);
      }
    }
  });

  // list of day elements
  var weekContainer; 

  $scope.addWeekContainer = function (weekCont) {
    weekContainer = weekCont;
  };

  $scope.updateBounds = function (end){
    $scope.bounds.end = end;
    updateBounds($scope.weeklist[0].start, $scope.weeklist[end].end);
  }

  $scope.nextWeek = function () {
    $scope.goToWeek(1);
  };

  $scope.previousWeek = function () {
    $scope.animateInfo.direction = 'left';
    addToWeekList($scope.weeklist, 'unshift');
    todayService.goToPreviousWeek();
    $timeout(function() {
      weekContainer.scope.rightSetUp();
      weekContainer.scope.animateRight();      
    });
  };

  $scope.animateFinishLeft = function (num){
    $scope.weeklist.splice(0, num);
    weekContainer.scope.backToZero();
    $timeout(function() {
      updateBounds($scope.weeklist[0].start, $scope.weeklist[$scope.bounds.end].end);
    });
  };

  $scope.animateFinishRight = function () {
    $scope.weeklist.pop();
    $timeout(function() {
      updateBounds($scope.weeklist[0].start, $scope.weeklist[$scope.bounds.end].end);
    });
  };

  $scope.goToWeek = function (index) {
    $scope.animateInfo.direction = 'right';
    $scope.animateInfo.clicked = index;
    todayService.goToWeek($scope.weeklist[index].start);
    var num = $scope.weeklist.length - (4-index);
    for(var i = 0; i < num; i ++){
      addToWeekList($scope.weeklist, 'push');
    }
    $timeout(function () {
      weekContainer.scope.animateLeft(index, num);
    });
  };

  // listeners for other week navigation methods

  $scope.$on('addedSelection', function (event, count) {
    $scope.weeklist[0].count = count;
  });

  $scope.$on('goToNextWeek', function () {
    $scope.nextWeek();
  });
  $scope.$on('goToPreviousWeek', function () {
    $scope.previousWeek();
  });

}])
.directive('boundCalc',['$timeout','$window', function ($timeout, $window) {
  return{
    restrict: 'A',
    link: function(scope,element,attr){
      var calcBounds = function () {
        var width = element.width() - 60;
        var child = element.find('.week-select');
        var childWidth = child.width() + 34;
        var numFit = Math.floor(width/childWidth);
        numFit = numFit - 1;
        scope.$apply(function(){
          scope.updateBounds(Math.max(0, numFit));
        });
      };
      angular.element($window).on('resize', calcBounds);
      $timeout(function (){
        calcBounds();
      });
    }
  }
}]);



},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
angular.module('dayTouch', [])
.factory('dayTouch.getCoords', function () {
	var dealWithTouches = function (event) {
    var touches = event.touches && event.touches.length ? event.touches : [event];
    return (event.changedTouches && event.changedTouches[0]) ||
        (event.originalEvent && event.originalEvent.changedTouches &&
            event.originalEvent.changedTouches[0]) ||
        touches[0].originalEvent || touches[0];
  }

  // returns the Client X and Y for the changed touches

  var getClientCoords = function (event) {
    var e = dealWithTouches(event);
    return {
      x: e.clientX,
      y: e.clientY
    };
  };

  // returns the Page X and Y for the changed touches  

  var getPageCoords = function (event) {
    var e = dealWithTouches(event);
    return {
      x: e.pageX,
      y: e.pageY
    };
  }


	return {
    getClient: getClientCoords,
    getPage: getPageCoords
  };
})

.factory('dayTouch.swipeAndScroll', [
  'dayTouch.getCoords',
  '$timeout',
  function (getCoords, $timeout){

    // set up flags and defauly properties

    var swipeActive = false;
    var touchStartX, touchStartY;
    var SWIPE_THRESHOLD = 10;
    var touchTimeOut = 0;


    return function (options) {
      // if no element is passed in throw an error?
      // alternatively it could return a bound div that could be appended to the page
      if(options.element){
        var element = options.element;
      } else {
        throw 'swipeAndScroll Requires an element to bind to';
      }
      // default all callbacks to a noop if they aren't passed in
      var noop = function () {};
      var after = options.after || noop;
      var left = options.left || options.right || noop;
      var right = options.right || left || noop;

      // initial touch down event, sets initial states and timeout
      var touchDown = function (e) {
        e.stopPropagation();
        swipeActive = true;
        element.on('touchmove', touchMove);
        var coords = getCoords.getClient(e);
        touchStartX = coords.x;
        touchStartY = coords.y;
        touchTimeOut = $timeout(function () {
          // if none of the other callbacks are called by the time
          // this runs it unbinds touch move prevents scrolling and triggers
          // the after callback
          element.unbind('touchmove', touchMove);
          e.preventDefault();
          after(e); 
        }, 400);
      };

      var touchMove = function (e) {
        if(!swipeActive){
          $timeout.cancel(touchTimeOut);
          element.unbind('touchmove', touchMove);
          return;
        }
        var coords = getCoords.getClient(e);
        var totX = Math.abs(coords.x - touchStartX);
        var totY = Math.abs(coords.y - touchStartY);
        if(totX < SWIPE_THRESHOLD && totY < SWIPE_THRESHOLD){
          // if the user hasn't left the minimum 
          // radius do nothing and continue to wait
          return; 
        }
        $timeout.cancel(touchTimeOut);
        if(totY > totX){
          // if more vertical than horizontal kill events allow scroll to take over
          swipeActive = false;
          element.unbind('touchmove', touchMove);
        }
        if(totY < totX && swipeActive){
          // if more horizontal than vertical bind the swipe listener
          e.preventDefault();
          e.stopPropagation();
          element.on('touchend', swipeEnd);
          swipeActive = !swipeActive;
        }
      };

      var swipeEnd = function (e) {
        var coords = getCoords.getClient(e);
        var totX = Math.abs(coords.x - touchStartX);
        var totY = Math.abs(coords.y - touchStartY);
        // timeout used to gracefully force the call back into the digest loop
        if(totY < totX){
          $timeout(function () {
            if(coords.x - touchStartX > 0){
              right(e);
            } else {
              left(e);
            }
          });
        }
        element.unbind('touchend', swipeEnd);
        element.unbind('touchmove', touchMove);
      };

      element.on('touchstart', touchDown);

    }
}]);
},{}],7:[function(require,module,exports){
(function () {
	var calendarFiltersApp = angular.module('calendarFilters', []);
	require('./services/weekdaysService.js');
	require('./services/monthService.js');
	require('./pastDayFilter.js');
	require('./dayOfWeekFilter.js');
	require('./dayOfMonthFilter.js');
	require('./dayOfWeekFromInt.js');
	require('./monthAbbrFilter.js');
	require('./monthFilter.js');
	require('./toArrayFilter.js');
	require('./sortedKeysFilter.js');
	require('./timeRangeFilter.js');
	require('./positionToTimeFilter.js');
	require('./zerotofour.js');
}())
},{"./dayOfMonthFilter.js":8,"./dayOfWeekFilter.js":9,"./dayOfWeekFromInt.js":10,"./monthAbbrFilter.js":11,"./monthFilter.js":12,"./pastDayFilter.js":13,"./positionToTimeFilter.js":14,"./services/monthService.js":15,"./services/weekdaysService.js":16,"./sortedKeysFilter.js":17,"./timeRangeFilter.js":18,"./toArrayFilter.js":19,"./zerotofour.js":20}],8:[function(require,module,exports){
calendarFiltersApp.filter('dayOfMonth', function () {
  return function (date) {
    return date.getDate();
  };
});
},{}],9:[function(require,module,exports){
calendarFiltersApp.filter('dayOfWeek', ['weekdaysService', function (weekdays) {
  return function (date) {
    var day = weekdays.getDay(date.getDay());
    day = day.slice(0,3);
    day = day.charAt(0).toUpperCase() + day.slice(1);
    return day;
  };
}]);
},{}],10:[function(require,module,exports){
calendarFiltersApp.filter('dayOfWeekFromInt', ['weekdaysService', function (weekdays) {
  return function (date) {
    var day = weekdays.getDay(date);
    day = day.slice(0,3);
    day = day.charAt(0).toUpperCase() + day.slice(1);
    return day;
  };
}]);

calendarFiltersApp.filter('intFromDay', [function () {
  return function (string) {
    var obj = {
      "mon": 0,
      "tue": 1,
      "wed": 2,
      "thu": 3,
      "fri": 4,
      "sat": 5,
      "sun": 6
    };
    return obj[string];
  };
}]);


},{}],11:[function(require,module,exports){
calendarFiltersApp.filter('monthAbbr', ['monthService', function (monthService) {
  return function (date) {
    var index = date.getMonth();
    var month = monthService.getMonth(index);
    month = index === 8 ? month.slice(0,4): month.slice(0,3);
    month = month.charAt(0).toUpperCase() + month.slice(1);
    return month;
  };
}]);
},{}],12:[function(require,module,exports){
calendarFiltersApp.filter('month', ['monthService', function (monthService) {
  return function (date) {
    var month = monthService.getMonth(date);
    return month.charAt(0).toUpperCase() + month.slice(1);
  };
}]);
},{}],13:[function(require,module,exports){
calendarFiltersApp.filter('pastDay', function () {
  return function (pastDay) {
    return pastDay ? "invalid-day" : "valid-day";
  };
});
},{}],14:[function(require,module,exports){
calendarFiltersApp.filter('positionToTime', function () {
  return function (position, timeBlock, perHour, MINSTEP) {
    var granualStep = position/timeBlock;
    var min = (granualStep % perHour) * MINSTEP;
    var min = Math.round(min);
    if (min < 10){
      min = "0" + min;
    }
    var hours = Math.floor(granualStep/perHour);
    return "" + hours + ":" + min;
  }
});

calendarFiltersApp.filter('nearestBlock', function () {
  return function (position, timeBlock) {
    var excess = position % timeBlock;
    return position - excess;
  };
});

calendarFiltersApp.filter('timeToFloat', function () {
  return function (time) {
    time = time.split(':');
    time = Number(time[0]) + (Number(time[1])/60);
    return time;
  };
});

},{}],15:[function(require,module,exports){
calendarFiltersApp.service('monthService', function () {
  var months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december'
  ];
  this.getMonth = function (monthIndex) {
    return months[monthIndex];
  };
  this.getDaysInMonth = function (monthIndex) {
    var date = new Date();
    date.setMonth(monthIndex + 1);
    date.setDate(0);
    return date.getDate();
  };
})
},{}],16:[function(require,module,exports){
calendarFiltersApp.service('weekdaysService', function () {
  var days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ];
  this.getDay = function(day){
    return days[(day)];
  }
})
},{}],17:[function(require,module,exports){
calendarFiltersApp.filter('sortedKeys', function () {
  return function (obj) {
    var keys = Object.keys(obj);
    return keys.sort();
  }
});
},{}],18:[function(require,module,exports){
calendarFiltersApp
.filter("timeRange",['$filter', function ($filter) {
  return function (selection) {
    var startTime = selection.time.split(":");
    var startHour = Number(startTime[0]);
    var startMinutes = Number(startTime[1]);
    var startAmPm = startHour >= 12 ? "pm" : "am";
    var durHours = Math.floor(selection.duration);
    var endHour, endMinutes;
    if (durHours > 0){
      endHour = startHour + durHours;
      endMinutes = (selection.duration % Math.floor(selection.duration)) * 60;
    } else {
      endHour = startHour;
      endMinutes = selection.duration * 60;
    }
    endMinutes += startMinutes;
    endMinutes = Math.round(endMinutes);
    if(endMinutes >= 60){
      endMinutes = endMinutes % 60;
      endHour += 1;
    }
    endMinutes = endMinutes < 10 ? "0" + endMinutes: endMinutes;
    var endAmPm = endHour >= 12 ? "pm" : "am";
    endHour = endHour%12 === 0 ? 12 : endHour%12;
    startHour = startHour%12 === 0 ? 12 : Number(startTime[0])%12;
    startTime = '' + startHour + ':' + startTime[1] + startAmPm;
    var endTime = '' + endHour + ':' + endMinutes + endAmPm;
    return startTime + ' - ' + endTime;
  }
}])
.filter('convert24to12', function () {
  return function (time) {
    if(time){
      var hourMin = time.split(':');
      var hour = Number(hourMin[0]);
      var min = Number(hourMin[1]);
      var suffix = (hour < 12) ? 'am' : 'pm';
      hour = (hour%12 === 0) ? 12 : hour%12;
      min = (min < 10) ? '0' + min: min;
      return "" + hour + ":" + min + ' ' + suffix;
    }
  }
});
},{}],19:[function(require,module,exports){
calendarFiltersApp.filter('toArray', function () {
  return function (obj) {
    var arr = [];
    angular.forEach(obj, function (item) {
      arr.push(item);
    });
    return arr;
  }
})
},{}],20:[function(require,module,exports){
calendarFiltersApp.filter('intToString', function () {
	return function (intiger) {
		switch (intiger){
			case 0: 
				return 'zero';
				break;
			case 1:
				return 'one';
				break;
			case 2:
				return 'two';
				break;
			case 3:
				return 'three';
				break;
			case 4:
				return 'four';
				break;
			case 5:
				return 'five';
				break;
			case 6:
				return 'six';
				break;
			case 7:
				return 'seven';
				break;
			case 8:
				return 'eight';
				break;
		}
	}
});

calendarFiltersApp.filter('timeFrames', function () {
	return function (sel) {
		if(sel === 1){
			return 'timeframe';
		} else {
			return 'timeframes';
		}
	}
});
},{}],21:[function(require,module,exports){
angular.module('granularityAvailability', []).service('granularityService', function () {
  // the minimum value for changes in the calender 
  this.MINUTESTEP = 60;
  // dont mess with these
  this.perHour = 60/this.MINUTESTEP;
  this.granularity = (24 * 60)/this.MINUTESTEP;
  // minimumLength
  this.consultationLength = 1;
});

angular.module('granularityScheduler', []).service('granularityService', function () {
  // the minimum value for changes in the calender 
  this.MINUTESTEP = 15;
  // dont mess with these
  this.perHour = 60/this.MINUTESTEP;
  this.granularity = (24 * 60)/this.MINUTESTEP;
  // the length of the consultation will be populated by request
  this.consultationLength = 1;
});
},{}],22:[function(require,module,exports){
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


},{}],23:[function(require,module,exports){
var calendarApp = angular.module('schedulerApp', [
	'selections',
	'suggestTimeScheduler',
	'CalendarAvb',
	'optionSelectApp', 
	'backboneHook',
	'scrollTo',
	'timeLabel',
	'timeBox',
	'calendarFilters',
	'weekSlide',
	'evTotalTimes',
	'evWeekNav',
	'evTimezone'
]);
calendarApp.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('<%');
  $interpolateProvider.endSymbol('%>');
});

require('./controllers/calendarAvailabilityCtrl.js');
require('./controllers/WeekNavCtrl.js');
require('./controllers/TotalTimesCtrl.js');

require('./timezoneService/timezoneService.js')

require('./availabilityService/availabilityService.js');

require('./todayService/todayService.js');

require('./granularity/granularityService.js');

require('./suggestTimes/counter/counter.js');
require('./suggestTimes/selectionServices/selectionMethodFactory.js');
require('./suggestTimes/selectionServices/selectionService.js');
require('./suggestTimes/suggestTimeSchedulerApp.js');


require('./filters/calendarAppFilters.js');


require('./stylingDirectives/timelabel.js');
require('./stylingDirectives/timebox.js');
require('./stylingDirectives/weekSlideAnimation.js');

require('./optionSelect/optionApp.js');

require('./backboneHook/backboneHook.js');

require('./scrollToNineAM/scrollToNineDirective.js')

require('./dayTouch/touchFactory.js');

},{"./availabilityService/availabilityService.js":1,"./backboneHook/backboneHook.js":2,"./controllers/TotalTimesCtrl.js":3,"./controllers/WeekNavCtrl.js":4,"./controllers/calendarAvailabilityCtrl.js":5,"./dayTouch/touchFactory.js":6,"./filters/calendarAppFilters.js":7,"./granularity/granularityService.js":21,"./optionSelect/optionApp.js":22,"./scrollToNineAM/scrollToNineDirective.js":24,"./stylingDirectives/timebox.js":25,"./stylingDirectives/timelabel.js":26,"./stylingDirectives/weekSlideAnimation.js":27,"./suggestTimes/counter/counter.js":28,"./suggestTimes/selectionServices/selectionMethodFactory.js":33,"./suggestTimes/selectionServices/selectionService.js":34,"./suggestTimes/suggestTimeSchedulerApp.js":35,"./timezoneService/timezoneService.js":37,"./todayService/todayService.js":38}],24:[function(require,module,exports){
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
},{}],25:[function(require,module,exports){
angular.module('timeBox', []).directive('timeBox', function () {
  return{
    compile: function (element){
      var el;
      for(var i = 1; i <= 48; i ++){
        var str = '';
        if(i % 2 === 0){
          str = '<div class="time-block-even"></div>';
        } else {
          str = '<div class="time-block-odd"></div>';
        }
        el = angular.element(str);
        element.append(el);
      }
    }
  }
});

},{}],26:[function(require,module,exports){
angular.module('timeLabel', []).directive('timeLabel', function () {
  return{
    compile: function (element){
      var el;
      for(var i = 0; i < 24; i ++){
        var str = '';
        if(i % 12 === 0){
          str += '12';
        } else {
          str += i%12;
        }
        if(i >= 12){
          str += ' pm';
        } else {
          str += ' am';
        }
        el = angular.element('<div class="time-label">'+str+'</div>');
        element.append(el);
      }
    }
  }
});


},{}],27:[function(require,module,exports){
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
},{}],28:[function(require,module,exports){
angular.module('counter', []).service('counter', function () {
  var counter = 0;
  this.getCount = function () {
    var retCount = counter;
    counter ++;
    return retCount;
  };
});
},{}],29:[function(require,module,exports){
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
},{}],30:[function(require,module,exports){
suggestTimeApp.directive('pastTime', function () {
  return {
    restrict: 'A',
    require:'^week',
    replace: true,
    scope: {
      pastTime: '=pastTime'
    },
    template: '<div class="invalid-day current-time"></div>',
    link: function (scope, element, attr, weekCtrl) {
      var parent = element.parent();
      
      scope.$watchCollection('pastTime', function () {
        var currentHour = scope.pastTime.hour;
        var currentMin = scope.pastTime.min;
        var endHour = currentHour * ((parent.height()/weekCtrl.granularity) * weekCtrl.perHour);
        var endMin = Math.ceil(currentMin/weekCtrl.MINSTEP) * (parent.height()/weekCtrl.granularity);
        var end = endHour + endMin;
        element.css({
          top: '0px',
          height: end + 'px'
        });
      });

    }
  }
});
},{}],31:[function(require,module,exports){
suggestTimeApp.directive('renderTime', function () {
  return {
    require: '^week',
    restrict: 'A',
    scope: {
      renderTime: "=renderTime"
    },
    link: function (scope, element, attr, weekCtrl) {
      var parent = element.parent();
      
      var day = Number(attr.dayofweek);

      var hasSpill;


      var hourMinAndDur = function (time, duration) {
        var hourMin = time.split(':');
        var hour = Number(hourMin[0]);
        var min = Number(hourMin[1])/60;
        hourMin = hour + min;
        return [hourMin + duration, hourMin];
      };

      var buildDiv = function (time, duration) {
        var top = (time)/24;
        var styles = {
          'top' : top * parent.height(),
          'height': (duration/24) * parent.height()
        };
        element.css(styles);
      };

      if(scope.renderTime){
        var time = scope.renderTime;
        var timeAndDur = hourMinAndDur(time.time, time.duration);
        var startTime = timeAndDur[1];
        var endTime = timeAndDur[0];
        var duration = time.duration;
        if (endTime > 24){
          var spillover = endTime - 24;
          weekCtrl.passToTomorrow(spillover, day);
          hasSpill = true;
          var duration = time.duration - spillover;
        }
        buildDiv(startTime, duration); 
      }



    }
  }

});
},{}],32:[function(require,module,exports){
suggestTimeApp.directive('selection', [
  '$document',
  '$filter',
  '$rootScope',
  'todayService',
  'dayTouch.getCoords',
  'dayTouch.swipeAndScroll',
  function (doc, $filter, $rootScope, todayService, getCoord, swipeAndScroll) {
  return {
    restrict: 'A',
    require: '^week',
    scope: {
      selection: '=selection',
      dayreff: '=dayreff'
    },
    replace: false,
    template: 
    '<div class="extendTop"></div>'+
    '<div class="time-display"><span ng-bind="selection|timeRange"></span></div>'+
    '<div class="delete-button control"><p>×</p></div>'+
    '<div class="extendBottom"></div>',
    link: function (scope, element, attr, weekCtrl){

      var parent = element.parent();
      weekCtrl.registerSelection(scope);

      element.addClass('creating');

      var granularity = function () {
        return parent.height()/weekCtrl.granularity;
      };

      var hourGranularity = function () {
        return parent.height()/24;
      };

      var perHour = weekCtrl.perHour;
      var MINSTEP = weekCtrl.MINSTEP;
      var minLength = weekCtrl.minLength;
      var TOUCH_ENABLED = Modernizr.touch;

      var positionToTime = $filter('positionToTime');
      var nearestBlock = $filter('nearestBlock');
      var timeToFloat = $filter('timeToFloat');
      var earliestTime = 0;

      // set earliset time if today
      scope.$watch('dayreff.isToday', function (data) {
        if(data){
          var time = todayService.getCurrentTime();
          var endHour = time.hour * (granularity() * perHour);
          var endMin = Math.ceil(time.min/MINSTEP) * granularity();
          earliestTime = (endHour + endMin);
        } else {
          earliestTime = 0;
        }
      });

      var hourMinAndDur = function (time, duration) {
        var hourMin = time.split(':');
        var hour = Number(hourMin[0]);
        var min = Number(hourMin[1])/60;
        hourMin = hour + min;
        return hourMin;
      };

      // builds the selection div
      var buildDiv = function (time, duration) {
        var top = (time)/24;
        var styles = {
          'top' : top * parent.height(),
          'height': (duration/24) * parent.height()
        };
        element.css(styles);
      };

      // redraw when when selection changes
      scope.$watch('selection', function () {
        var time = scope.selection;
        var timeAndDur = hourMinAndDur(time.time);
        var startTime = timeAndDur;
        var duration = time.duration;
        buildDiv(startTime, duration);
      }, true);

      scope.mouseUp = function () {
        element.removeClass('active');
        element.removeClass('resize');
        element.removeClass('dragging');
        element.removeClass('creating');
      };

      // move
      scope.mouseMoveCenter = function (position) {
        position = nearestBlock(position, granularity());
        // mouse position or the lenght of the selection from the bottom of the page
        position = Math.min(position, parent.height() - (scope.selection.duration/24)*parent.height());
        // mouse position of top of element
        position = Math.max(position, earliestTime);
        var time = positionToTime(position, granularity(), weekCtrl.perHour, weekCtrl.MINSTEP);
        scope.selection.time = time;
        weekCtrl.addSelection(scope.selection);
      };

      // extend bottom
      scope.mouseMoveBottom = function (position) {
        var startPosition = timeToFloat(scope.selection.time);
        startPosition = (startPosition/24)*parent.height();
        position = nearestBlock(position, granularity());
        position = Math.min(position, parent.height());
        var duration = position - startPosition;
        var remainder = duration % granularity();
        duration = (position >= parent.height())? duration: duration - remainder + granularity();
        duration = Math.max((duration/hourGranularity()), minLength);
        scope.selection.duration = duration;
        weekCtrl.addSelection(scope.selection);
      };

      // extend top
      scope.mouseMoveTop = function (position) {
        // set up old values
        var startPosition = timeToFloat(scope.selection.time);
        startPosition = (startPosition/24)*parent.height();
        var endPosition = startPosition + ((scope.selection.duration/24)*parent.height());

        // new start time
        position = nearestBlock(position, granularity());
        //change to min consultaion length currently 1 hour above end
        position = Math.min(position, endPosition - ((1/24) * parent.height()));
        position = Math.max(position, earliestTime);

        var duration = endPosition - position;
        var remainder = duration % granularity();
        // round up by calendar granularity
        duration = (duration - remainder);

        // min length or duration converted to hours
        duration = Math.max(duration/hourGranularity(), minLength);

        // save the new time
        scope.selection.duration = duration;
        var time = positionToTime(position, granularity(), weekCtrl.perHour, weekCtrl.MINSTEP);
        scope.selection.time = time;
        weekCtrl.addSelection(scope.selection);
      };

      var mousedown = function (event) {
        // return if left button click
        element.addClass('active');
        if(!TOUCH_ENABLED && event.which !== 1){
          return;
        }

        event.preventDefault()
        event.stopPropagation();

        $target = $(event.target);

        var pageY = getCoord.getPage(event).y;

        // current positions for smarter scrolling
        var startPosition = timeToFloat(scope.selection.time);
        startPosition = (startPosition/24)*parent.height();
        var endPosition = startPosition + ((scope.selection.duration/24)*parent.height());

        // switch params based on which handle was clicked
        if($target.hasClass('delete-button') || $target.parent().hasClass('delete-button')){
          weekCtrl.removeAndUpdate(scope.selection);
          $rootScope.$broadcast('calendarChange');
        } else if($target.hasClass('extendTop')){
          weekCtrl.subscribeSelection(scope.selection.created, 'top', endPosition, pageY, element.height());
          element.addClass('resize');
          $rootScope.$broadcast('calendarChange');
        } else if ($target.hasClass('extendBottom')){
          element.addClass('resize');
          weekCtrl.subscribeSelection(scope.selection.created, 'bottom', startPosition, pageY, element.height());
          $rootScope.$broadcast('calendarChange');
        } else {
          element.addClass('dragging');
          var mousePos= pageY - parent.offset().top;
          var mouseDiff = element.offset().top - parent.offset().top;
          weekCtrl.subscribeSelection(scope.selection.created, 'center', mousePos - mouseDiff, pageY, element.height());
          $rootScope.$broadcast('calendarChange');
        }
      };

      // allow swiping on top of selections

      if(TOUCH_ENABLED){
        var right = function (day, e) {
          var self = this;
          scope.$apply(function () {
            self.$parent.goToDay(day - 1);
          });
        };
        var left = function (day, e) {
          var self = this;
          scope.$apply(function () {
            self.$parent.goToDay(day + 1);
          });
        };
        var after = function (md, e) {
          md(e);
        };
        var boundRight = angular.bind(scope, right, scope.dayreff.dayOfWeek); 
        var boundLeft = angular.bind(scope, left, scope.dayreff.dayOfWeek);
        var boundAfter = angular.bind(this, after, mousedown);
        if(angular.element('.week-container').width() < 500){
          swipeAndScroll({element: element, right: boundRight, left: boundLeft, after: boundAfter});
        } else {
          swipeAndScroll({element: element, after: boundAfter});
        }
      } else {
        element.on('mousedown', mousedown);
      }
      
    }
  }
}])
},{}],33:[function(require,module,exports){
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
},{}],34:[function(require,module,exports){
angular.module('selections',['selectionMethods']).service('selectionService', [
	'$rootScope',
	'selectionMethods',
	'$timeout',
	function ($rootScope, selectionMethods, $timeout) {
	var selectedDates = this.selectedDates = {};
	selectedDates.selections = {};
	var daysBeingUpdated = {};

	var cleanUp = selectionMethods.cleanUp;

	this.selectedDates.total = 0;

	var getKey = function (date) {
		var year = date.getFullYear();
		var month = (date.getMonth() < 10) ? '0' + date.getMonth() : date.getMonth();
		var day = (date.getDate() < 10) ? '0' + date.getDate() : date.getDate();
		return "" + year + month + day;
	};

	this.timezoneCheck = function (date, currentTime) {
		var key = getKey(date);
		var yesterday = new Date(date);
		yesterday.setDate(date.getDate() - 1);
		var yesterdayKey = getKey(yesterday);
		if (selectedDates.selections[yesterdayKey]){
			delete selectedDates.selections[yesterdayKey]
		}
		if (selectedDates.selections[key]) {
			angular.forEach(selectedDates.selections[key], function (selection) {
				var startTime = selection.time.split(':');
				startTime = Number(startTime[0]) + (Number(startTime[1])/60);
				if (startTime < currentTime){
					delete selectedDates.selections[key][selection.created];
				}
			})
		}
	};

	var addDate = function (date) {
			var key = getKey(date.date);
			if(selectedDates.selections[key]){
				selectedDates.selections[key][date.created] = date;
			} else {
				selectedDates.selections[key] = {};
				selectedDates.selections[key][date.created] = date;
			}
			daysBeingUpdated[key] = { 
																'day' : key,
																'time' : date.created 
															};
	};

	var getTotal = function () {
		var total = 0;
		angular.forEach(selectedDates.selections, function (day){
			total += Object.keys(day).length;
		});
		return total;
	};

	this.addDate = function (date) {
    // $timeout places the callback function in the next digest loop without interacting with the current loop
		$timeout(function(){
			addDate(date);
		});
	};

	this.addDates = function (arr) {
		$timeout(function () {
			angular.forEach(arr, function (date) {
				addDate(date);
			});
		});
	};

	this.getWeekTotal = function (week) {
		var total = 0;
		angular.forEach(week, function (day) {
			var key = getKey(day.date);
			if(selectedDates.selections[key]){
				total += Object.keys(selectedDates.selections[key]).length;
			}
		});
		return total;
	};


	this.getOutBounds = function (lowDate, highDate) {
		
		// get the key for first and last day in week list
		var lowKey = getKey(lowDate), highKey = getKey(highDate);
		var dayList = Object.keys(selectedDates.selections);

		var aboveCount = 0, belowCount = 0;

		for(var i = 0; i < dayList.length; i ++){
			if(dayList[i] < lowKey){
				belowCount += Object.keys(selectedDates.selections[dayList[i]]).length;
			} else if (dayList[i] > highKey){
				aboveCount += Object.keys(selectedDates.selections[dayList[i]]).length;
			}
		}
		
		return {above: aboveCount, below: belowCount};
	};

	this.getFirstSelection = function () {
		var keyList = Object.keys(selectedDates.selections);
		if(keyList.length){
			var firstDayKey = Object.keys(selectedDates.selections).sort()[0];
			var firstDay = selectedDates.selections[firstDayKey];
			var earliest;
			angular.forEach(firstDay, function (sel) {
				if(!earliest){
					earliest = sel;
				}
				if(sel.time < earliest.time){
					earliest = sel;
				}
			});
			return earliest;
		} else {
			return undefined;
		}
	};

	this.mouseUpEvent = function (week) {
		var self = this
		$timeout(function() {
			angular.forEach(daysBeingUpdated, function (day) {
				cleanUp(selectedDates.selections[day.day], day.time, day.day, selectedDates.selections);
			});
			daysBeingUpdated = {};
			var count = self.getWeekTotal(week);
			selectedDates.total = getTotal();
			$rootScope.$broadcast('addedSelection', count);
		});
	};

	this.updateWeek = function (week) {
		var self = this;
		$timeout(function() {
			var count = self.getWeekTotal(week);
			$rootScope.$broadcast('addedSelection', count);
		});
	};

	this.removeDate = function (date){
		$timeout(function() {
			var key = getKey(date.date);
			if(selectedDates.selections[key]){
				if(selectedDates.selections[key][date.created]){
					delete selectedDates.selections[key][date.created];
				}
			}
      // delete the whole bucket if its empty
			if(selectedDates.selections[key] && isEmptyObject(selectedDates.selections[key])){
				delete selectedDates.selections[key];
			}
			selectedDates.total --;
		});
	};

	this.getDate = function (date) {
		var key = getKey(date);
		return (selectedDates.selections[key] !== undefined) ? selectedDates.selections[key] : {};
	};

	this.getSelectedDates = function () {
		return selectedDates.selections;
	};

	this.getSelectedContainer = function () {
		return selectedDates;
	}


	this.save = function () {
		// selectionMethods.save(selectedDates);
	};
	
}]);
},{}],35:[function(require,module,exports){
(function () {
	var suggestTimeApp = angular.module('suggestTimeScheduler', [
		'counter', 
		'todayService',
		'selections',
		'dayTouch'
	]);
	require('./dayDirective.js');
	require('./weekDirective.js');
	require('./pastTimeDirective.js');
	require('./selectionDirective.js');
	require('./renderTimeDirective.js')
}());
},{"./dayDirective.js":29,"./pastTimeDirective.js":30,"./renderTimeDirective.js":31,"./selectionDirective.js":32,"./weekDirective.js":36}],36:[function(require,module,exports){
suggestTimeApp.directive('week', function () {
  return {
    restrict: 'A',
    transclude: true,
    replace:true,
    controller: [
    '$scope', 
    '$element', 
    '$document', 
    'selectionService',
    'granularityService',
    '$timeout',
    'dayTouch.getCoords',
    function (scope, element, doc, selectionService, granularityService, $timeout, getCoords) {
      
      var self = this;
      var days = [];
      var selections = {};
      var clickDay;
      var body = angular.element('body');

      var INTERVAL = 20;


      this.perHour = granularityService.perHour;
      this.MINSTEP = granularityService.MINUTESTEP;
      this.granularity = granularityService.granularity;
      this.minLength = granularityService.consultationLength;




      this.getLocation = function (pageY) {
        return pageY - element.offset().top + element.scrollTop();
      };

      // -----------------Scroll Controls------------------

      // refference point for determining direction shifts
      var prevPosition;

      //stores a reference to the set timeout so that it can be stopped
      var scrollTimeout = 0;
      var scrollDown = function (location, func, end) {
        var current = self.getLocation(location);
        if(element[0].scrollHeight - element.scrollTop() <= element.outerHeight()){
          clearInterval(scrollTimeout)
          scrollTimeout = 0;
        } else if(end && current > end){
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        } else if(current < prevPosition){
          // mouse is moving up
          prevPosition = current;
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        } else {
          var scrollPosition = element.scrollTop();
          element.scrollTop(scrollPosition + 5);
          func(self.getLocation(location));
        }
      };

      var scrollUp = function (location, func, start) {
        var current = self.getLocation(location);
        if (element.scrollTop() === 0) {
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        } else if(start && current < start) {
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        } else if(current > prevPosition) {
          // mouse is moving down
          prevPosition = current;
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        } else {
          prevPosition = current;
          var scrollPosition = element.scrollTop();
          element.scrollTop(scrollPosition - 5);
          func(self.getLocation(location));
        }
      };

      // --------------Creating Selections --------------
      // each day returns its own selection object
      var tellDaysToDraw = function (location) {
        var arr = [];
        angular.forEach(days, function (day) {
          if(day.subscribed){
            arr.push(day.scope.mouseMove(location));
          }
        });
        selectionService.addDates(arr);
      };

      // subscribe days touch
      var bindDayTouch = function (e) {
        // remove the legend width from later calcs
        var legend = element.children().first();
        var legendWidth = legend.width();
        var totWidth = element.width() - legendWidth;
        // width of a day
        var dayWidth = totWidth/7;
        // remove el offset
        var offLeft = element.offset().left;
        var pageX = getCoords.getPage(e).x;
        var inWeekX = pageX - offLeft - legendWidth;
        // calculate which day the touch is in;
        var dayTouchIn = Math.floor(inWeekX/dayWidth);
        // if touch has changed days run the addentered function 
        if(dayTouchIn !== clickDay){
          addEntered(dayTouchIn);
          touchIn = dayTouchIn;
        }
      };

      // move call back
      var mouseMove = function (e) {
        e.preventDefault();
        // if its a tablet run the bind day touch function to handle mouseenter
        if(e.data.type === 'touch' && element.width() > 400){
          bindDayTouch(e);
        }

        // set up the auto scroll areas
        var bottomScrollArea = (element.offset().top + element.height()) - 100; 
        var topScrollArea = element.offset().top + 100;
        // set up ev location
        var pageY = getCoords.getPage(e).y;
        var location = self.getLocation(pageY);

        // if the scroll function is already running stop it
        if(scrollTimeout){
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        }
        // set up scroll events if mouse enters top or bottom area
        if(pageY > bottomScrollArea){
          if(!scrollTimeout){
            scrollTimeout = setInterval(scrollDown, INTERVAL, pageY, tellDaysToDraw);
          }
        } else if (pageY < topScrollArea) {
          if(!scrollTimeout){
            scrollTimeout = setInterval(scrollUp, INTERVAL, pageY, tellDaysToDraw);
          }
        }

        // tell all subscribed days to update base on new mouse position
        tellDaysToDraw(location)
      };

      // sets the calendar back to the initial event listening state
      var mouseUp = function (e) {
        if (scrollTimeout) {
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        }

        var pageY = getCoords.getPage(e).y;

        // unsubscribe all days and trigger their mous up functions
        angular.forEach(days, function (day) {
          day.subscribed = false;
          day.scope.mouseUp(pageY, e.data.type);
        });

        // tell the selection service to clean up new data
        selectionService.mouseUpEvent(scope.week);

        // remove active from all selections
        angular.forEach(selections, function (sel){
          sel.scope.mouseUp();
        });
        // unbind week events
        var evTarget = (e.data.type === 'mouse')? doc: body;
        var evEnd = (e.data.type === 'mouse')? 'mouseup':'touchend';
        var evMove = (e.data.type === 'mouse')?'mousemove': 'touchmove';
        evTarget.unbind(evMove, mouseMove);
        evTarget.unbind(evEnd, mouseUp);
      };

      // called by the day directive
      this.onDayMouseDown = function (clicked, clickedTime, type) {
        var dayClicked = days[clicked];
        dayClicked.subscribed = true;
        prevPosition = clickedTime;
        // set up event info
        var eData = {type: type};
        var endEv = (type === 'mouse')? 'mouseup': 'touchend';
        var moveEv = (type === 'mouse')? 'mousemove': 'touchmove';
        var evTarget = (type === 'mouse')? doc: body;
        // bind events
        evTarget.on(endEv,eData, mouseUp);
        evTarget.on(moveEv,eData, mouseMove);

        // convert every day to listen 
        angular.forEach(days, function (day) {
          if(day.scope.day.dayOfWeek !== clicked){
            day.scope.bindDayEvents(clickedTime, type);
          }
        });

        // save a reference to which day was the original event
        clickDay = clicked;
      };

      // called by day if mouse or by bindDayTouch if touch
      this.addEntered = function (entered) {
        // create the range of active days
        var start = Math.min(entered, clickDay);
        var end = Math.max(entered, clickDay);
        for (var i = 0; i < 7; i ++){
          // subscribe all days in range to the mouse move event
          if (i >= start && i <= end){
            if(!days[i].scope.day.hasPast){
              days[i].subscribed = true;
            }
          } else {
            // unsubscribe all outside range
            days[i].subscribed = false;
            days[i].scope.unsubscribe();
          }
        }
      };

      // variable refference for inside call backs

      var addEntered = this.addEntered;

      // --------------Editing Selections --------------

      var editingSelection;

      var moveSelection = function (e, func) {
        e.preventDefault();
        var bottomScrollArea = (element.offset().top + element.height()) - 100; 
        var topScrollArea = element.offset().top + 100;
        var pageY = getCoords.getPage(e).y;
        var location = self.getLocation(pageY);

        var topSelection = pageY;
        var bottomSelection = pageY;

        // optionally add the distance from the mouse to the top of the element
        if(e.data && e.data.elOffset){
          location = location - e.data.elOffset;
          pageY = pageY - e.data.elOffset;
          topSelection = pageY;
          bottomSelection = pageY + e.data.elHeight;
        }
        
        if(scrollTimeout){
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        }
        // endpos and startpos used to stop date inversion and scrolling when not editing 
        if(bottomSelection > bottomScrollArea && topSelection < topScrollArea){
          if(pageY > prevPosition){
            scrollTimeout = setInterval(scrollDown,10,pageY, func);
          } else {
            scrollTimeout = setInterval(scrollUp,10,pageY, func);
          }
        }else if(bottomSelection > bottomScrollArea){
          var endPos;
          if(e.data && e.data.endPos){
            endPos = e.data.endPos;
          }
          if(!scrollTimeout){
            if(!endPos || pageY > endPos){
              scrollTimeout = setInterval(scrollDown, INTERVAL, pageY, func, endPos);
            }
          }
        } else if (topSelection < topScrollArea) {
          var startPos;
          if(e.data && e.data.startPos){
            startPos = e.data.startPos;
          }
          if(!scrollTimeout){
            if(!startPos || pageY > startPos){
              scrollTimeout = setInterval(scrollUp, INTERVAL, pageY, func, startPos);
            }
          }
        }

        func(location);

      };

      var editMoveEvent = function (e) {
        moveSelection(e, e.data.cb);
      };

      // different cbs for edit type
      var passMoveToSelection = function (location) {
        selections[editingSelection].scope.mouseMoveCenter(location);
      };

      var extendSelectionBottom = function (location) {
        selections[editingSelection].scope.mouseMoveBottom(location);
      };

      var extendSelectionTop = function (location) {
        selections[editingSelection].scope.mouseMoveTop(location);
      };

      var selectionMouseup = function () {
        if (scrollTimeout) {
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        }
        // clean up selection service
        selectionService.mouseUpEvent(scope.week);
        selections[editingSelection].scope.mouseUp();
        element.removeClass('dragging');
        element.removeClass('resize');

        doc.unbind('mousemove touchmove', editMoveEvent);
        doc.unbind('mouseup touchend', selectionMouseup);
      };

      // called by seleciont
      this.subscribeSelection = function (selectionKey, handle, posInfo, current, height) {
        prevPosition = this.getLocation(current);
        editingSelection = selectionKey;
        // handle guides which type of edit
        switch (handle){
          case 'top':
            element.addClass('resize');
            var evData = {
              endPos: posInfo,
              cb: extendSelectionTop
            };
            break;
          case 'bottom':
            element.addClass('resize');
            var evData = {
              startPos: posInfo,
              cb: extendSelectionBottom
            };
            break;
          default:
            element.addClass('dragging');
            var evData = {
              elOffset: posInfo,
              elHeight: height,
              cb: passMoveToSelection
            };
            break;
        }

        doc.on('mousemove touchmove', evData, editMoveEvent);
        doc.on('mouseup touchend', selectionMouseup);
      };

      // ------------- registering children ----------------

      var dayCount = 0;
      this.addDay = function (scope) {
        var day = {};
        day.scope = scope;
        // when the week changes this function is called 7 times.
        // Using the count prevents having to deal with async issues. 
        days[dayCount % 7] = day;
        dayCount ++;
      };

      this.passToTomorrow = function (excess, day) {
        var tomorrow = (day+1)%7;
        scope.passToDay(excess, tomorrow);
      };

      this.registerSelection = function (scope) {
        selections[scope.selection.created] = {
          scope: scope
        };
      };

      // passes a single new selection to the selection service
      this.addSelection = function (date) {
        selectionService.addDate(date);
      };

      // removes a selection from the selection service
      this.removeSelection = function (date) {
        selectionService.removeDate(date);
      };
      // 
      this.removeAndUpdate = function (date) {
        selectionService.removeDate(date);
        selectionService.updateWeek(scope.week);
      };


    }],
    template:'<div class="week-container" ng-transclude></div>',
  }
})
},{}],37:[function(require,module,exports){
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
},{}],38:[function(require,module,exports){
angular.module('todayService', []).service('todayService', function () {
  var currentWeek = [];
  var today = new Date();
  var self = this;

  var TIMEBUFFER = 1;

  var currentTime = new Date();
  var time = {
    hour: currentTime.getHours() + TIMEBUFFER >= 24 ? 23.75 : currentTime.getHours() + TIMEBUFFER,
    min: currentTime.getMinutes(),
    date: currentTime
  };

  this.changeToday = function (newDate) {
    today = newDate;
  };

  this.changeCurrentTime = function (newTime) {
    currentTime = new Date(newTime+'Z');
    var offset = currentTime.getTimezoneOffset()/60;
    time.hour = currentTime.getHours() + offset + TIMEBUFFER >= 24 ? 23.75 : currentTime.getHours() + offset + TIMEBUFFER;
    time.min = currentTime.getMinutes();
    this.changeToday(currentTime);
    this.goToWeek(currentTime);
    return currentTime;
  };

  var repopulateWeek = function (newWeek) {
    currentWeek.length = 0;
    angular.forEach(newWeek, function(day) {
      currentWeek.push(day);
    });
  };

  this.compare = function(date1, date2){
    if(date1.getYear() < date2.getYear()){
      return "past";
    } else if (date1.getYear() === date2.getYear()) {
      if(date1.getMonth() < date2.getMonth()){
        return "past";
      } else if (date1.getMonth() === date2.getMonth()){
        if(date1.getDate() < date2.getDate()){
          return "past";
        } else if (date1.getDate() > date2.getDate()){
          return "future";
        } else {
          return "today";
        }
      } else {
        return "future";
      }
    } else {
      return "future";
    }
  };

  this.getToday = function () {
    return today;
  };

  this.getDayOfWeek = function () {
    return (today.getDay() - 1) < 0? 6: today.getDay() - 1;
  }

  this.getDateWeek = function () {
    return currentWeek;
  };

  this.goToNextWeek = function () {
    var monday = new Date(currentWeek[6].date.getTime());
    monday.setDate(currentWeek[6].date.getDate() + 1);
    this.goToWeek(monday);
  };

  this.goToPreviousWeek = function () {
    var sunday = new Date(currentWeek[0].date.getTime());
    sunday.setDate(currentWeek[0].date.getDate() - 1);
    this.goToWeek(sunday);
  };

  this.goToWeek = function (startDay) {
    var week = this.createWeek(startDay);
    repopulateWeek(week);
    return week;
  };

  this.createWeek = function (startDay) {
    var dayOfWeek = (startDay.getDay() - 1) < 0? 6: startDay.getDay() - 1;
    var week = [];
    var day;
    var offset;
    for(var i = 0; i < 7; i++){
      day = {};
      day.dayOfWeek = i;
      date = new Date(startDay.getTime());
      if(dayOfWeek === i){
        day.date = date;
      } else if (dayOfWeek < i){
        offset = i - dayOfWeek;
        date.setDate(startDay.getDate() + offset);
        day.date = date;
      } else if (dayOfWeek > i){
        offset = dayOfWeek - i;
        date.setDate(startDay.getDate() - offset);
        day.date = date;
      }
      var comparison = this.compare(day.date, today);
      switch (comparison) {
        case "past":
          day.hasPast = true;
          day.isToday = false;
          break;
        case "future":
          day.hasPast = false;
          day.isToday = false;
          break;
        case "today":
          day.hasPast = false;
          day.isToday = true;
          break;
      }
      var month = day.date.getMonth(), dayOfMonth = day.date.getDate();
      month = (month < 10) ? '0' + month: month;
      dayOfMonth = (dayOfMonth < 10) ? '0' + dayOfMonth: dayOfMonth;
      day.dayString = "" + day.date.getFullYear() + month + dayOfMonth;
      week[i] = day;
    }
    return week;
  };

  var init = function () {
    self.goToWeek(today);
  };

  this.getCurrentTime = function () {
    return time;
  };

  init();

});
},{}]},{},[23])