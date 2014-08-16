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