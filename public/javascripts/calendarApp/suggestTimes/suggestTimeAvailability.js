(function () {
	var suggestTimeApp = angular.module('suggestTimeAvailability', ['counter', 'todayService','availabilitySelect', 'dayTouch']);
	require('./dayDirective.js');
	require('./weekDirective.js');
	require('./selectionDirective.js');
}());