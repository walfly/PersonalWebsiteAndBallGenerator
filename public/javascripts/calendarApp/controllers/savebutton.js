// ('angular/angular.js');

angular.module('saveButton', ['availabilitySelect']).controller('SaveButtonCtrl', ['$scope','selectionService', function ($scope, selections) {
  $scope.showing = false;

  $scope.$on('calendarChange', function () {
    $scope.showing = true;
  })

  $scope.saveSelections = function () {
    selections.save();
    $scope.showing = false;
  };
}]);