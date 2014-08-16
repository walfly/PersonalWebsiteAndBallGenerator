// ('angular/angular.js');

angular.module('counter', []).service('counter', function () {
  var counter = 0;
  this.getCount = function () {
    var retCount = counter;
    counter ++;
    return retCount;
  };
});