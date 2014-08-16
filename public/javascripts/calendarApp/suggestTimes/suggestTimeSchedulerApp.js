// ('angular/angular.js');

var suggestTimeApp = angular.module('suggestTimeScheduler', [
	'counter', 
	'todayService',
	'selections',
	'dayTouch'
]);
suggestTimeApp.directive('day',[
	'todayService',
	'counter',
	'$rootScope',
	'$timeout',
	'dayTouch.getCoords',
	'dayTouch.swipeAndScroll',
	require('./dayDirective.js')
]);
suggestTimeApp.directive('week', require('./weekDirective.js'));
suggestTimeApp.directive('pastTime', require('./pastTimeDirective.js'));
suggestTimeApp.directive('selection', [
	'$document',
	'$filter',
	'$rootScope',
	'todayService',
	'dayTouch.getCoords',
	'dayTouch.swipeAndScroll',
	require('./selectionDirective.js')
]);
suggestTimeApp.directive('renderTime', require('./renderTimeDirective.js'));
