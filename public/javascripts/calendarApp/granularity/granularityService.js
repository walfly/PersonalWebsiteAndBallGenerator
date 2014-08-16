angular.module('granularityAvailability', []).service('granularityService', function () {
  // the minimum value for changes in the calender 
  this.MINUTESTEP = 60;
  // dont mess with these
  this.perHour = 60/this.MINUTESTEP;
  this.granularity = (24 * 60)/this.MINUTESTEP;
  // minimumLength
  this.consultationLength = 1;
});

angular.module('granularityScheduler', []).service('granularityService', function () {
  // the minimum value for changes in the calender 
  this.MINUTESTEP = 15;
  // dont mess with these
  this.perHour = 60/this.MINUTESTEP;
  this.granularity = (24 * 60)/this.MINUTESTEP;
  // the length of the consultation will be populated by request
  this.consultationLength = 1;
});