// ('angular/angular.js');

angular.module('backboneHook', []).directive('backboneHook', function () {
	return {
		controller: ['$scope', '$element', '$timeout', function ($scope, element, $timeout) {
			$scope.bbState = {
				display: false,
				suggest: true
			};
			$scope.switchBBState = function () {
				$scope.bbState.suggest = !$scope.bbState.suggest;
			};
		}]
	}
});