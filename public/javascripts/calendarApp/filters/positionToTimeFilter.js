// positionToTime
exports.positionToTime = function () {
  return function (position, timeBlock, perHour, MINSTEP) {
    var granualStep = position/timeBlock;
    var min = (granualStep % perHour) * MINSTEP;
    var min = Math.round(min);
    if (min < 10){
      min = "0" + min;
    }
    var hours = Math.floor(granualStep/perHour);
    return "" + hours + ":" + min;
  }
};
// nearestBlock
exports.nearestBlock = function () {
  return function (position, timeBlock) {
    var excess = position % timeBlock;
    return position - excess;
  };
};
// timeToFloat
exports.timeToFloat = function () {
  return function (time) {
    time = time.split(':');
    time = Number(time[0]) + (Number(time[1])/60);
    return time;
  };
};
