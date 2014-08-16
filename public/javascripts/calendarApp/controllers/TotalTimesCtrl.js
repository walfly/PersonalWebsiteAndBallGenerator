angular.module('evTotalTimes',['selections']).controller('evTotalTimes.Ctrl', [
	'$scope',
	'selectionService',
	function ($scope, selections) {
		$scope.selections = selections.getSelectedContainer(); 
}]);