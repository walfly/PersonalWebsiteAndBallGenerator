angular.module('timeBox', []).directive('timeBox', function () {
  return{
    compile: function (element){
      var el;
      for(var i = 1; i <= 48; i ++){
        var str = '';
        if(i % 2 === 0){
          str = '<div class="time-block-even"></div>';
        } else {
          str = '<div class="time-block-odd"></div>';
        }
        el = angular.element(str);
        element.append(el);
      }
    }
  }
});
