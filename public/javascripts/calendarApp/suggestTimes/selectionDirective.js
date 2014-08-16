suggestTimeApp.directive('selection', [
  '$document',
  '$filter',
  '$rootScope',
  'todayService',
  'dayTouch.getCoords',
  'dayTouch.swipeAndScroll',
  function (doc, $filter, $rootScope, todayService, getCoord, swipeAndScroll) {
  return {
    restrict: 'A',
    require: '^week',
    scope: {
      selection: '=selection',
      dayreff: '=dayreff'
    },
    replace: false,
    template: 
    '<div class="extendTop"></div>'+
    '<div class="time-display"><span ng-bind="selection|timeRange"></span></div>'+
    '<div class="delete-button control"><p>×</p></div>'+
    '<div class="extendBottom"></div>',
    link: function (scope, element, attr, weekCtrl){

      var parent = element.parent();
      weekCtrl.registerSelection(scope);

      element.addClass('creating');

      var granularity = function () {
        return parent.height()/weekCtrl.granularity;
      };

      var hourGranularity = function () {
        return parent.height()/24;
      };

      var perHour = weekCtrl.perHour;
      var MINSTEP = weekCtrl.MINSTEP;
      var minLength = weekCtrl.minLength;
      var TOUCH_ENABLED = Modernizr.touch;

      var positionToTime = $filter('positionToTime');
      var nearestBlock = $filter('nearestBlock');
      var timeToFloat = $filter('timeToFloat');
      var earliestTime = 0;

      // set earliset time if today
      scope.$watch('dayreff.isToday', function (data) {
        if(data){
          var time = todayService.getCurrentTime();
          var endHour = time.hour * (granularity() * perHour);
          var endMin = Math.ceil(time.min/MINSTEP) * granularity();
          earliestTime = (endHour + endMin);
        } else {
          earliestTime = 0;
        }
      });

      var hourMinAndDur = function (time, duration) {
        var hourMin = time.split(':');
        var hour = Number(hourMin[0]);
        var min = Number(hourMin[1])/60;
        hourMin = hour + min;
        return hourMin;
      };

      // builds the selection div
      var buildDiv = function (time, duration) {
        var top = (time)/24;
        var styles = {
          'top' : top * parent.height(),
          'height': (duration/24) * parent.height()
        };
        element.css(styles);
      };

      // redraw when when selection changes
      scope.$watch('selection', function () {
        var time = scope.selection;
        var timeAndDur = hourMinAndDur(time.time);
        var startTime = timeAndDur;
        var duration = time.duration;
        buildDiv(startTime, duration);
      }, true);

      scope.mouseUp = function () {
        element.removeClass('active');
        element.removeClass('resize');
        element.removeClass('dragging');
        element.removeClass('creating');
      };

      // move
      scope.mouseMoveCenter = function (position) {
        position = nearestBlock(position, granularity());
        // mouse position or the lenght of the selection from the bottom of the page
        position = Math.min(position, parent.height() - (scope.selection.duration/24)*parent.height());
        // mouse position of top of element
        position = Math.max(position, earliestTime);
        var time = positionToTime(position, granularity(), weekCtrl.perHour, weekCtrl.MINSTEP);
        scope.selection.time = time;
        weekCtrl.addSelection(scope.selection);
      };

      // extend bottom
      scope.mouseMoveBottom = function (position) {
        var startPosition = timeToFloat(scope.selection.time);
        startPosition = (startPosition/24)*parent.height();
        position = nearestBlock(position, granularity());
        position = Math.min(position, parent.height());
        var duration = position - startPosition;
        var remainder = duration % granularity();
        duration = (position >= parent.height())? duration: duration - remainder + granularity();
        duration = Math.max((duration/hourGranularity()), minLength);
        scope.selection.duration = duration;
        weekCtrl.addSelection(scope.selection);
      };

      // extend top
      scope.mouseMoveTop = function (position) {
        // set up old values
        var startPosition = timeToFloat(scope.selection.time);
        startPosition = (startPosition/24)*parent.height();
        var endPosition = startPosition + ((scope.selection.duration/24)*parent.height());

        // new start time
        position = nearestBlock(position, granularity());
        //change to min consultaion length currently 1 hour above end
        position = Math.min(position, endPosition - ((1/24) * parent.height()));
        position = Math.max(position, earliestTime);

        var duration = endPosition - position;
        var remainder = duration % granularity();
        // round up by calendar granularity
        duration = (duration - remainder);

        // min length or duration converted to hours
        duration = Math.max(duration/hourGranularity(), minLength);

        // save the new time
        scope.selection.duration = duration;
        var time = positionToTime(position, granularity(), weekCtrl.perHour, weekCtrl.MINSTEP);
        scope.selection.time = time;
        weekCtrl.addSelection(scope.selection);
      };

      var mousedown = function (event) {
        // return if left button click
        element.addClass('active');
        if(!TOUCH_ENABLED && event.which !== 1){
          return;
        }

        event.preventDefault()
        event.stopPropagation();

        $target = $(event.target);

        var pageY = getCoord.getPage(event).y;

        // current positions for smarter scrolling
        var startPosition = timeToFloat(scope.selection.time);
        startPosition = (startPosition/24)*parent.height();
        var endPosition = startPosition + ((scope.selection.duration/24)*parent.height());

        // switch params based on which handle was clicked
        if($target.hasClass('delete-button') || $target.parent().hasClass('delete-button')){
          weekCtrl.removeAndUpdate(scope.selection);
          $rootScope.$broadcast('calendarChange');
        } else if($target.hasClass('extendTop')){
          weekCtrl.subscribeSelection(scope.selection.created, 'top', endPosition, pageY, element.height());
          element.addClass('resize');
          $rootScope.$broadcast('calendarChange');
        } else if ($target.hasClass('extendBottom')){
          element.addClass('resize');
          weekCtrl.subscribeSelection(scope.selection.created, 'bottom', startPosition, pageY, element.height());
          $rootScope.$broadcast('calendarChange');
        } else {
          element.addClass('dragging');
          var mousePos= pageY - parent.offset().top;
          var mouseDiff = element.offset().top - parent.offset().top;
          weekCtrl.subscribeSelection(scope.selection.created, 'center', mousePos - mouseDiff, pageY, element.height());
          $rootScope.$broadcast('calendarChange');
        }
      };

      // allow swiping on top of selections

      if(TOUCH_ENABLED){
        var right = function (day, e) {
          var self = this;
          scope.$apply(function () {
            self.$parent.goToDay(day - 1);
          });
        };
        var left = function (day, e) {
          var self = this;
          scope.$apply(function () {
            self.$parent.goToDay(day + 1);
          });
        };
        var after = function (md, e) {
          md(e);
        };
        var boundRight = angular.bind(scope, right, scope.dayreff.dayOfWeek); 
        var boundLeft = angular.bind(scope, left, scope.dayreff.dayOfWeek);
        var boundAfter = angular.bind(this, after, mousedown);
        if(angular.element('.week-container').width() < 500){
          swipeAndScroll({element: element, right: boundRight, left: boundLeft, after: boundAfter});
        } else {
          swipeAndScroll({element: element, after: boundAfter});
        }
      } else {
        element.on('mousedown', mousedown);
      }
      
    }
  }
}])