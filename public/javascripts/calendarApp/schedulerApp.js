var calendarApp = angular.module('schedulerApp', [
	'selections',
	'suggestTimeScheduler',
	'CalendarAvb',
	'optionSelectApp', 
	'backboneHook',
	'scrollTo',
	'timeLabel',
	'timeBox',
	'calendarFilters',
	'weekSlide',
	'evTotalTimes',
	'evWeekNav',
	'evTimezone'
]);

require('./controllers/calendarAvailabilityCtrl.js');
require('./controllers/WeekNavCtrl.js');
require('./controllers/TotalTimesCtrl.js');

require('./timezoneService/timezoneService.js')

require('./availabilityService/availabilityService.js');

require('./todayService/todayService.js');

require('./granularity/granularityService.js');

require('./suggestTimes/counter/counter.js');
require('./suggestTimes/selectionServices/selectionMethodFactory.js');
require('./suggestTimes/selectionServices/selectionService.js');
require('./suggestTimes/suggestTimeSchedulerApp.js');


require('./filters/calendarAppFilters.js');


require('./stylingDirectives/timelabel.js');
require('./stylingDirectives/timebox.js');
require('./stylingDirectives/weekSlideAnimation.js');

require('./optionSelect/optionApp.js');

require('./backboneHook/backboneHook.js');

require('./scrollToNineAM/scrollToNineDirective.js')

require('./dayTouch/touchFactory.js');
