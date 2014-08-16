// ('angular/angular.js');

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