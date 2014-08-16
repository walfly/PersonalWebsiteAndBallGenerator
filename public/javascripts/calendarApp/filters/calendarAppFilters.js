// ('angular/angular.js');

var calendarFiltersApp = angular.module('calendarFilters', []);
calendarFiltersApp.service('weekdaysService', require('./services/weekdaysService.js'));
calendarFiltersApp.service('monthService', require('./services/monthService.js'));
calendarFiltersApp.filter('dayOfWeek',['weekdaysService', require('./dayOfWeekFilter.js')]);
calendarFiltersApp.filter('dayOfMonth', require('./dayOfMonthFilter.js'));
calendarFiltersApp.filter('dayOfWeekFromInt',['weekdaysService', require('./dayOfWeekFromInt.js').dayOfWeekFromInt]);
calendarFiltersApp.filter('intFromDay', require('./dayOfWeekFromInt.js').intFromDay);
calendarFiltersApp.filter('monthAbbr', ['monthService', require('./monthAbbrFilter.js')]);
calendarFiltersApp.filter('month', ['monthService', require('./monthFilter.js')]);
calendarFiltersApp.filter('pastDay', require('./pastDayFilter.js'));
calendarFiltersApp.filter('toArray', require('./toArrayFilter.js'));
calendarFiltersApp.filter('sortedKeys', require('./sortedKeysFilter.js'));
calendarFiltersApp.filter('timeRange', require('./timeRangeFilter.js').timeRange);
calendarFiltersApp.filter('convert24to12', require('./timeRangeFilter.js').converter);
calendarFiltersApp.filter('positionToTime', require('./positionToTimeFilter.js').positionToTime);
calendarFiltersApp.filter('nearestBlock', require('./positionToTimeFilter.js').nearestBlock);
calendarFiltersApp.filter('timeToFloat', require('./positionToTimeFilter.js').timeToFloat);
calendarFiltersApp.filter('intToString', require('./zerotofour.js').intToString);
calendarFiltersApp.filter('timeFrames', require('./zerotofour.js').timeFrames);
