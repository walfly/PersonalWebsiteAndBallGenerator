// timeRange deps $filter
exports.timeRange = function ($filter) {
  return function (selection) {
    var startTime = selection.time.split(":");
    var startHour = Number(startTime[0]);
    var startMinutes = Number(startTime[1]);
    var startAmPm = startHour >= 12 ? "pm" : "am";
    var durHours = Math.floor(selection.duration);
    var endHour, endMinutes;
    if (durHours > 0){
      endHour = startHour + durHours;
      endMinutes = (selection.duration % Math.floor(selection.duration)) * 60;
    } else {
      endHour = startHour;
      endMinutes = selection.duration * 60;
    }
    endMinutes += startMinutes;
    endMinutes = Math.round(endMinutes);
    if(endMinutes >= 60){
      endMinutes = endMinutes % 60;
      endHour += 1;
    }
    endMinutes = endMinutes < 10 ? "0" + endMinutes: endMinutes;
    var endAmPm = endHour >= 12 ? "pm" : "am";
    endHour = endHour%12 === 0 ? 12 : endHour%12;
    startHour = startHour%12 === 0 ? 12 : Number(startTime[0])%12;
    startTime = '' + startHour + ':' + startTime[1] + startAmPm;
    var endTime = '' + endHour + ':' + endMinutes + endAmPm;
    return startTime + ' - ' + endTime;
  }
};

// convert24to12 no deps
exports.convert = function () {
  return function (time) {
    if(time){
      var hourMin = time.split(':');
      var hour = Number(hourMin[0]);
      var min = Number(hourMin[1]);
      var suffix = (hour < 12) ? 'am' : 'pm';
      hour = (hour%12 === 0) ? 12 : hour%12;
      min = (min < 10) ? '0' + min: min;
      return "" + hour + ":" + min + ' ' + suffix;
    }
  }
};