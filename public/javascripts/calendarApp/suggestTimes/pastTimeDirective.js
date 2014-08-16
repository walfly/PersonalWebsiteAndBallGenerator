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