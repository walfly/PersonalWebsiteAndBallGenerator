// ('angular/angular.js');

angular.module('evWeekNav', ['todayService', 'selections'])
.controller('WeekNavCtrl', [
  '$scope',
  'todayService',
  'selectionService',
  '$timeout',
  function ($scope, todayService, selectionService, $timeout) {
  // current week
  $scope.week = todayService.getDateWeek();
  // number of selections outside of bound
  $scope.bounds = {above:0, below:0, end: 2};
  // list of weeks for rendering
  $scope.weeklist = [];
  // push first week on intialize
  // for slide animations
  $scope.animateInfo = {
    direction: '',
    clicked : 0
  };


  var populateWeekList = function (firstWeek) {
    $scope.weeklist.length = 0;
    $scope.weeklist.push({
      start: firstWeek[0].date,
      end: firstWeek[6].date,
      week: firstWeek,
      count: selectionService.getWeekTotal(firstWeek)
    });
    for(var i = 0; i < 3; i ++){
      addToWeekList($scope.weeklist, 'push');
    };

    // set up initial bounds
    updateBounds($scope.weeklist[0].start, $scope.weeklist[$scope.bounds.end].end);
  };

  // adds the next of previous week
  var addToWeekList = function (list, side) {
    var week, date, count;
    var i = (side === 'push')? list.length - 1: 0;
    var offset =  (side === 'push')? 1: (-8);
    date = new Date(list[i].end.getTime());
    date.setDate(date.getDate() + offset);
    week = todayService.createWeek(date);
    count = selectionService.getWeekTotal(week);
    list[side]({
      start: week[0].date,
      end: week[6].date,
      week: week,
      count: count
    });
  };

  var updateBounds = function (low, high) {
    var bounds = selectionService.getOutBounds(low, high)
    $scope.bounds.above = bounds.above;
    $scope.bounds.below = bounds.below;
  };

  populateWeekList($scope.week);
// when cal state changes goto the first week with a selection
  $scope.$watch('bbState.suggest', function (data){
    if(!data){
      var firstSel = selectionService.getFirstSelection();
      if(firstSel){
        var week = todayService.goToWeek(selectionService.getFirstSelection().date);
        populateWeekList(week);
      }
    }
  });

  // list of day elements
  var weekContainer; 

  $scope.addWeekContainer = function (weekCont) {
    weekContainer = weekCont;
  };

  $scope.updateBounds = function (end){
    $scope.bounds.end = end;
    updateBounds($scope.weeklist[0].start, $scope.weeklist[end].end);
  }

  $scope.nextWeek = function () {
    $scope.goToWeek(1);
  };

  $scope.previousWeek = function () {
    $scope.animateInfo.direction = 'left';
    addToWeekList($scope.weeklist, 'unshift');
    todayService.goToPreviousWeek();
    $timeout(function() {
      weekContainer.scope.rightSetUp();
      weekContainer.scope.animateRight();      
    });
  };

  $scope.animateFinishLeft = function (num){
    $scope.weeklist.splice(0, num);
    weekContainer.scope.backToZero();
    $timeout(function() {
      updateBounds($scope.weeklist[0].start, $scope.weeklist[$scope.bounds.end].end);
    });
  };

  $scope.animateFinishRight = function () {
    $scope.weeklist.pop();
    $timeout(function() {
      updateBounds($scope.weeklist[0].start, $scope.weeklist[$scope.bounds.end].end);
    });
  };

  $scope.goToWeek = function (index) {
    $scope.animateInfo.direction = 'right';
    $scope.animateInfo.clicked = index;
    todayService.goToWeek($scope.weeklist[index].start);
    var num = $scope.weeklist.length - (4-index);
    for(var i = 0; i < num; i ++){
      addToWeekList($scope.weeklist, 'push');
    }
    $timeout(function () {
      weekContainer.scope.animateLeft(index, num);
    });
  };

  // listeners for other week navigation methods

  $scope.$on('addedSelection', function (event, count) {
    $scope.weeklist[0].count = count;
  });

  $scope.$on('goToNextWeek', function () {
    $scope.nextWeek();
  });
  $scope.$on('goToPreviousWeek', function () {
    $scope.previousWeek();
  });

}])
.directive('boundCalc',['$timeout','$window', function ($timeout, $window) {
  return{
    restrict: 'A',
    link: function(scope,element,attr){
      var calcBounds = function () {
        var width = element.width() - 60;
        var child = element.find('.week-select');
        var childWidth = child.width() + 34;
        var numFit = Math.floor(width/childWidth);
        numFit = numFit - 1;
        scope.$apply(function(){
          scope.updateBounds(Math.max(0, numFit));
        });
      };
      angular.element($window).on('resize', calcBounds);
      $timeout(function (){
        calcBounds();
      });
    }
  }
}]);


