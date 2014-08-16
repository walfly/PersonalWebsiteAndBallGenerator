// week no deps
module.exports = function () {
  return {
    restrict: 'A',
    transclude: true,
    replace:true,
    controller: [
    '$scope', 
    '$element', 
    '$document', 
    'selectionService',
    'granularityService',
    '$timeout',
    'dayTouch.getCoords',
    function (scope, element, doc, selectionService, granularityService, $timeout, getCoords) {
      
      var self = this;
      var days = [];
      var selections = {};
      var clickDay;
      var body = angular.element('body');

      var INTERVAL = 20;


      this.perHour = granularityService.perHour;
      this.MINSTEP = granularityService.MINUTESTEP;
      this.granularity = granularityService.granularity;
      this.minLength = granularityService.consultationLength;




      this.getLocation = function (pageY) {
        return pageY - element.offset().top + element.scrollTop();
      };

      // -----------------Scroll Controls------------------

      // refference point for determining direction shifts
      var prevPosition;

      //stores a reference to the set timeout so that it can be stopped
      var scrollTimeout = 0;
      var scrollDown = function (location, func, end) {
        var current = self.getLocation(location);
        if(element[0].scrollHeight - element.scrollTop() <= element.outerHeight()){
          clearInterval(scrollTimeout)
          scrollTimeout = 0;
        } else if(end && current > end){
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        } else if(current < prevPosition){
          // mouse is moving up
          prevPosition = current;
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        } else {
          var scrollPosition = element.scrollTop();
          element.scrollTop(scrollPosition + 5);
          func(self.getLocation(location));
        }
      };

      var scrollUp = function (location, func, start) {
        var current = self.getLocation(location);
        if (element.scrollTop() === 0) {
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        } else if(start && current < start) {
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        } else if(current > prevPosition) {
          // mouse is moving down
          prevPosition = current;
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        } else {
          prevPosition = current;
          var scrollPosition = element.scrollTop();
          element.scrollTop(scrollPosition - 5);
          func(self.getLocation(location));
        }
      };

      // --------------Creating Selections --------------
      // each day returns its own selection object
      var tellDaysToDraw = function (location) {
        var arr = [];
        angular.forEach(days, function (day) {
          if(day.subscribed){
            arr.push(day.scope.mouseMove(location));
          }
        });
        selectionService.addDates(arr);
      };

      // subscribe days touch
      var bindDayTouch = function (e) {
        // remove the legend width from later calcs
        var legend = element.children().first();
        var legendWidth = legend.width();
        var totWidth = element.width() - legendWidth;
        // width of a day
        var dayWidth = totWidth/7;
        // remove el offset
        var offLeft = element.offset().left;
        var pageX = getCoords.getPage(e).x;
        var inWeekX = pageX - offLeft - legendWidth;
        // calculate which day the touch is in;
        var dayTouchIn = Math.floor(inWeekX/dayWidth);
        // if touch has changed days run the addentered function 
        if(dayTouchIn !== clickDay){
          addEntered(dayTouchIn);
          touchIn = dayTouchIn;
        }
      };

      // move call back
      var mouseMove = function (e) {
        e.preventDefault();
        // if its a tablet run the bind day touch function to handle mouseenter
        if(e.data.type === 'touch' && element.width() > 400){
          bindDayTouch(e);
        }

        // set up the auto scroll areas
        var bottomScrollArea = (element.offset().top + element.height()) - 100; 
        var topScrollArea = element.offset().top + 100;
        // set up ev location
        var pageY = getCoords.getPage(e).y;
        var location = self.getLocation(pageY);

        // if the scroll function is already running stop it
        if(scrollTimeout){
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        }
        // set up scroll events if mouse enters top or bottom area
        if(pageY > bottomScrollArea){
          if(!scrollTimeout){
            scrollTimeout = setInterval(scrollDown, INTERVAL, pageY, tellDaysToDraw);
          }
        } else if (pageY < topScrollArea) {
          if(!scrollTimeout){
            scrollTimeout = setInterval(scrollUp, INTERVAL, pageY, tellDaysToDraw);
          }
        }

        // tell all subscribed days to update base on new mouse position
        tellDaysToDraw(location)
      };

      // sets the calendar back to the initial event listening state
      var mouseUp = function (e) {
        if (scrollTimeout) {
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        }

        var pageY = getCoords.getPage(e).y;

        // unsubscribe all days and trigger their mous up functions
        angular.forEach(days, function (day) {
          day.subscribed = false;
          day.scope.mouseUp(pageY, e.data.type);
        });

        // tell the selection service to clean up new data
        selectionService.mouseUpEvent(scope.week);

        // remove active from all selections
        angular.forEach(selections, function (sel){
          sel.scope.mouseUp();
        });
        // unbind week events
        var evTarget = (e.data.type === 'mouse')? doc: body;
        var evEnd = (e.data.type === 'mouse')? 'mouseup':'touchend';
        var evMove = (e.data.type === 'mouse')?'mousemove': 'touchmove';
        evTarget.unbind(evMove, mouseMove);
        evTarget.unbind(evEnd, mouseUp);
      };

      // called by the day directive
      this.onDayMouseDown = function (clicked, clickedTime, type) {
        var dayClicked = days[clicked];
        dayClicked.subscribed = true;
        prevPosition = clickedTime;
        // set up event info
        var eData = {type: type};
        var endEv = (type === 'mouse')? 'mouseup': 'touchend';
        var moveEv = (type === 'mouse')? 'mousemove': 'touchmove';
        var evTarget = (type === 'mouse')? doc: body;
        // bind events
        evTarget.on(endEv,eData, mouseUp);
        evTarget.on(moveEv,eData, mouseMove);

        // convert every day to listen 
        angular.forEach(days, function (day) {
          if(day.scope.day.dayOfWeek !== clicked){
            day.scope.bindDayEvents(clickedTime, type);
          }
        });

        // save a reference to which day was the original event
        clickDay = clicked;
      };

      // called by day if mouse or by bindDayTouch if touch
      this.addEntered = function (entered) {
        // create the range of active days
        var start = Math.min(entered, clickDay);
        var end = Math.max(entered, clickDay);
        for (var i = 0; i < 7; i ++){
          // subscribe all days in range to the mouse move event
          if (i >= start && i <= end){
            if(!days[i].scope.day.hasPast){
              days[i].subscribed = true;
            }
          } else {
            // unsubscribe all outside range
            days[i].subscribed = false;
            days[i].scope.unsubscribe();
          }
        }
      };

      // variable refference for inside call backs

      var addEntered = this.addEntered;

      // --------------Editing Selections --------------

      var editingSelection;

      var moveSelection = function (e, func) {
        e.preventDefault();
        var bottomScrollArea = (element.offset().top + element.height()) - 100; 
        var topScrollArea = element.offset().top + 100;
        var pageY = getCoords.getPage(e).y;
        var location = self.getLocation(pageY);

        var topSelection = pageY;
        var bottomSelection = pageY;

        // optionally add the distance from the mouse to the top of the element
        if(e.data && e.data.elOffset){
          location = location - e.data.elOffset;
          pageY = pageY - e.data.elOffset;
          topSelection = pageY;
          bottomSelection = pageY + e.data.elHeight;
        }
        
        if(scrollTimeout){
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        }
        // endpos and startpos used to stop date inversion and scrolling when not editing 
        if(bottomSelection > bottomScrollArea && topSelection < topScrollArea){
          if(pageY > prevPosition){
            scrollTimeout = setInterval(scrollDown,10,pageY, func);
          } else {
            scrollTimeout = setInterval(scrollUp,10,pageY, func);
          }
        }else if(bottomSelection > bottomScrollArea){
          var endPos;
          if(e.data && e.data.endPos){
            endPos = e.data.endPos;
          }
          if(!scrollTimeout){
            if(!endPos || pageY > endPos){
              scrollTimeout = setInterval(scrollDown, INTERVAL, pageY, func, endPos);
            }
          }
        } else if (topSelection < topScrollArea) {
          var startPos;
          if(e.data && e.data.startPos){
            startPos = e.data.startPos;
          }
          if(!scrollTimeout){
            if(!startPos || pageY > startPos){
              scrollTimeout = setInterval(scrollUp, INTERVAL, pageY, func, startPos);
            }
          }
        }

        func(location);

      };

      var editMoveEvent = function (e) {
        moveSelection(e, e.data.cb);
      };

      // different cbs for edit type
      var passMoveToSelection = function (location) {
        selections[editingSelection].scope.mouseMoveCenter(location);
      };

      var extendSelectionBottom = function (location) {
        selections[editingSelection].scope.mouseMoveBottom(location);
      };

      var extendSelectionTop = function (location) {
        selections[editingSelection].scope.mouseMoveTop(location);
      };

      var selectionMouseup = function () {
        if (scrollTimeout) {
          clearInterval(scrollTimeout);
          scrollTimeout = 0;
        }
        // clean up selection service
        selectionService.mouseUpEvent(scope.week);
        selections[editingSelection].scope.mouseUp();
        element.removeClass('dragging');
        element.removeClass('resize');

        doc.unbind('mousemove touchmove', editMoveEvent);
        doc.unbind('mouseup touchend', selectionMouseup);
      };

      // called by seleciont
      this.subscribeSelection = function (selectionKey, handle, posInfo, current, height) {
        prevPosition = this.getLocation(current);
        editingSelection = selectionKey;
        // handle guides which type of edit
        switch (handle){
          case 'top':
            element.addClass('resize');
            var evData = {
              endPos: posInfo,
              cb: extendSelectionTop
            };
            break;
          case 'bottom':
            element.addClass('resize');
            var evData = {
              startPos: posInfo,
              cb: extendSelectionBottom
            };
            break;
          default:
            element.addClass('dragging');
            var evData = {
              elOffset: posInfo,
              elHeight: height,
              cb: passMoveToSelection
            };
            break;
        }

        doc.on('mousemove touchmove', evData, editMoveEvent);
        doc.on('mouseup touchend', selectionMouseup);
      };

      // ------------- registering children ----------------

      var dayCount = 0;
      this.addDay = function (scope) {
        var day = {};
        day.scope = scope;
        // when the week changes this function is called 7 times.
        // Using the count prevents having to deal with async issues. 
        days[dayCount % 7] = day;
        dayCount ++;
      };

      this.passToTomorrow = function (excess, day) {
        var tomorrow = (day+1)%7;
        scope.passToDay(excess, tomorrow);
      };

      this.registerSelection = function (scope) {
        selections[scope.selection.created] = {
          scope: scope
        };
      };

      // passes a single new selection to the selection service
      this.addSelection = function (date) {
        selectionService.addDate(date);
      };

      // removes a selection from the selection service
      this.removeSelection = function (date) {
        selectionService.removeDate(date);
      };
      // 
      this.removeAndUpdate = function (date) {
        selectionService.removeDate(date);
        selectionService.updateWeek(scope.week);
      };


    }],
    template:'<div class="week-container" ng-transclude></div>'
  }
};