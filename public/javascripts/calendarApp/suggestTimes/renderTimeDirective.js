suggestTimeApp.directive('renderTime', function () {
  return {
    require: '^week',
    restrict: 'A',
    scope: {
      renderTime: "=renderTime"
    },
    link: function (scope, element, attr, weekCtrl) {
      var parent = element.parent();
      
      var day = Number(attr.dayofweek);

      var hasSpill;


      var hourMinAndDur = function (time, duration) {
        var hourMin = time.split(':');
        var hour = Number(hourMin[0]);
        var min = Number(hourMin[1])/60;
        hourMin = hour + min;
        return [hourMin + duration, hourMin];
      };

      var buildDiv = function (time, duration) {
        var top = (time)/24;
        var styles = {
          'top' : top * parent.height(),
          'height': (duration/24) * parent.height()
        };
        element.css(styles);
      };

      if(scope.renderTime){
        var time = scope.renderTime;
        var timeAndDur = hourMinAndDur(time.time, time.duration);
        var startTime = timeAndDur[1];
        var endTime = timeAndDur[0];
        var duration = time.duration;
        if (endTime > 24){
          var spillover = endTime - 24;
          weekCtrl.passToTomorrow(spillover, day);
          hasSpill = true;
          var duration = time.duration - spillover;
        }
        buildDiv(startTime, duration); 
      }



    }
  }

});