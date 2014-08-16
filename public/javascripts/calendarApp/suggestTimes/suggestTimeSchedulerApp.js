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