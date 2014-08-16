// ('angular/angular.js');

angular.module('todayService', []).service('todayService', function () {
  var currentWeek = [];
  var today = new Date();
  var self = this;

  var TIMEBUFFER = 1;

  var currentTime = new Date();
  var time = {
    hour: currentTime.getHours() + TIMEBUFFER >= 24 ? 23.75 : currentTime.getHours() + TIMEBUFFER,
    min: currentTime.getMinutes(),
    date: currentTime
  };

  this.changeToday = function (newDate) {
    today = newDate;
  };

  this.changeCurrentTime = function (newTime) {
    currentTime = new Date(newTime+'Z');
    var offset = currentTime.getTimezoneOffset()/60;
    time.hour = currentTime.getHours() + offset + TIMEBUFFER >= 24 ? 23.75 : currentTime.getHours() + offset + TIMEBUFFER;
    time.min = currentTime.getMinutes();
    this.changeToday(currentTime);
    this.goToWeek(currentTime);
    return currentTime;
  };

  var repopulateWeek = function (newWeek) {
    currentWeek.length = 0;
    angular.forEach(newWeek, function(day) {
      currentWeek.push(day);
    });
  };

  this.compare = function(date1, date2){
    if(date1.getYear() < date2.getYear()){
      return "past";
    } else if (date1.getYear() === date2.getYear()) {
      if(date1.getMonth() < date2.getMonth()){
        return "past";
      } else if (date1.getMonth() === date2.getMonth()){
        if(date1.getDate() < date2.getDate()){
          return "past";
        } else if (date1.getDate() > date2.getDate()){
          return "future";
        } else {
          return "today";
        }
      } else {
        return "future";
      }
    } else {
      return "future";
    }
  };

  this.getToday = function () {
    return today;
  };

  this.getDayOfWeek = function () {
    return (today.getDay() - 1) < 0? 6: today.getDay() - 1;
  }

  this.getDateWeek = function () {
    return currentWeek;
  };

  this.goToNextWeek = function () {
    var monday = new Date(currentWeek[6].date.getTime());
    monday.setDate(currentWeek[6].date.getDate() + 1);
    this.goToWeek(monday);
  };

  this.goToPreviousWeek = function () {
    var sunday = new Date(currentWeek[0].date.getTime());
    sunday.setDate(currentWeek[0].date.getDate() - 1);
    this.goToWeek(sunday);
  };

  this.goToWeek = function (startDay) {
    var week = this.createWeek(startDay);
    repopulateWeek(week);
    return week;
  };

  this.createWeek = function (startDay) {
    var dayOfWeek = (startDay.getDay() - 1) < 0? 6: startDay.getDay() - 1;
    var week = [];
    var day;
    var offset;
    for(var i = 0; i < 7; i++){
      day = {};
      day.dayOfWeek = i;
      date = new Date(startDay.getTime());
      if(dayOfWeek === i){
        day.date = date;
      } else if (dayOfWeek < i){
        offset = i - dayOfWeek;
        date.setDate(startDay.getDate() + offset);
        day.date = date;
      } else if (dayOfWeek > i){
        offset = dayOfWeek - i;
        date.setDate(startDay.getDate() - offset);
        day.date = date;
      }
      var comparison = this.compare(day.date, today);
      switch (comparison) {
        case "past":
          day.hasPast = true;
          day.isToday = false;
          break;
        case "future":
          day.hasPast = false;
          day.isToday = false;
          break;
        case "today":
          day.hasPast = false;
          day.isToday = true;
          break;
      }
      var month = day.date.getMonth(), dayOfMonth = day.date.getDate();
      month = (month < 10) ? '0' + month: month;
      dayOfMonth = (dayOfMonth < 10) ? '0' + dayOfMonth: dayOfMonth;
      day.dayString = "" + day.date.getFullYear() + month + dayOfMonth;
      week[i] = day;
    }
    return week;
  };

  var init = function () {
    self.goToWeek(today);
  };

  this.getCurrentTime = function () {
    return time;
  };

  init();

});