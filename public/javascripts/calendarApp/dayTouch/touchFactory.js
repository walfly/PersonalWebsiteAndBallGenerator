angular.module('dayTouch', [])
.factory('dayTouch.getCoords', function () {
	var dealWithTouches = function (event) {
    var touches = event.touches && event.touches.length ? event.touches : [event];
    return (event.changedTouches && event.changedTouches[0]) ||
        (event.originalEvent && event.originalEvent.changedTouches &&
            event.originalEvent.changedTouches[0]) ||
        touches[0].originalEvent || touches[0];
  }

  // returns the Client X and Y for the changed touches

  var getClientCoords = function (event) {
    var e = dealWithTouches(event);
    return {
      x: e.clientX,
      y: e.clientY
    };
  };

  // returns the Page X and Y for the changed touches  

  var getPageCoords = function (event) {
    var e = dealWithTouches(event);
    return {
      x: e.pageX,
      y: e.pageY
    };
  }


	return {
    getClient: getClientCoords,
    getPage: getPageCoords
  };
})

.factory('dayTouch.swipeAndScroll', [
  'dayTouch.getCoords',
  '$timeout',
  function (getCoords, $timeout){

    // set up flags and defauly properties

    var swipeActive = false;
    var touchStartX, touchStartY;
    var SWIPE_THRESHOLD = 10;
    var touchTimeOut = 0;


    return function (options) {
      // if no element is passed in throw an error?
      // alternatively it could return a bound div that could be appended to the page
      if(options.element){
        var element = options.element;
      } else {
        throw 'swipeAndScroll Requires an element to bind to';
      }
      // default all callbacks to a noop if they aren't passed in
      var noop = function () {};
      var after = options.after || noop;
      var left = options.left || options.right || noop;
      var right = options.right || left || noop;

      // initial touch down event, sets initial states and timeout
      var touchDown = function (e) {
        e.stopPropagation();
        swipeActive = true;
        element.on('touchmove', touchMove);
        var coords = getCoords.getClient(e);
        touchStartX = coords.x;
        touchStartY = coords.y;
        touchTimeOut = $timeout(function () {
          // if none of the other callbacks are called by the time
          // this runs it unbinds touch move prevents scrolling and triggers
          // the after callback
          element.unbind('touchmove', touchMove);
          e.preventDefault();
          after(e); 
        }, 400);
      };

      var touchMove = function (e) {
        if(!swipeActive){
          $timeout.cancel(touchTimeOut);
          element.unbind('touchmove', touchMove);
          return;
        }
        var coords = getCoords.getClient(e);
        var totX = Math.abs(coords.x - touchStartX);
        var totY = Math.abs(coords.y - touchStartY);
        if(totX < SWIPE_THRESHOLD && totY < SWIPE_THRESHOLD){
          // if the user hasn't left the minimum 
          // radius do nothing and continue to wait
          return; 
        }
        $timeout.cancel(touchTimeOut);
        if(totY > totX){
          // if more vertical than horizontal kill events allow scroll to take over
          swipeActive = false;
          element.unbind('touchmove', touchMove);
        }
        if(totY < totX && swipeActive){
          // if more horizontal than vertical bind the swipe listener
          e.preventDefault();
          e.stopPropagation();
          element.on('touchend', swipeEnd);
          swipeActive = !swipeActive;
        }
      };

      var swipeEnd = function (e) {
        var coords = getCoords.getClient(e);
        var totX = Math.abs(coords.x - touchStartX);
        var totY = Math.abs(coords.y - touchStartY);
        // timeout used to gracefully force the call back into the digest loop
        if(totY < totX){
          $timeout(function () {
            if(coords.x - touchStartX > 0){
              right(e);
            } else {
              left(e);
            }
          });
        }
        element.unbind('touchend', swipeEnd);
        element.unbind('touchmove', touchMove);
      };

      element.on('touchstart', touchDown);

    }
}]);