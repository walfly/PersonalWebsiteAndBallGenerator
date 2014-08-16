// ('angular/angular.js');

angular.module('selections',['selectionMethods']).service('selectionService', [
	'$rootScope',
	'selectionMethods',
	'$timeout',
	function ($rootScope, selectionMethods, $timeout) {
	var selectedDates = this.selectedDates = {};
	selectedDates.selections = {};
	var daysBeingUpdated = {};

	var cleanUp = selectionMethods.cleanUp;

	this.selectedDates.total = 0;

	var getKey = function (date) {
		var year = date.getFullYear();
		var month = (date.getMonth() < 10) ? '0' + date.getMonth() : date.getMonth();
		var day = (date.getDate() < 10) ? '0' + date.getDate() : date.getDate();
		return "" + year + month + day;
	};

	this.timezoneCheck = function (date, currentTime) {
		var key = getKey(date);
		var yesterday = new Date(date);
		yesterday.setDate(date.getDate() - 1);
		var yesterdayKey = getKey(yesterday);
		if (selectedDates.selections[yesterdayKey]){
			delete selectedDates.selections[yesterdayKey]
		}
		if (selectedDates.selections[key]) {
			angular.forEach(selectedDates.selections[key], function (selection) {
				var startTime = selection.time.split(':');
				startTime = Number(startTime[0]) + (Number(startTime[1])/60);
				if (startTime < currentTime){
					delete selectedDates.selections[key][selection.created];
				}
			})
		}
	};

	var addDate = function (date) {
			var key = getKey(date.date);
			if(selectedDates.selections[key]){
				selectedDates.selections[key][date.created] = date;
			} else {
				selectedDates.selections[key] = {};
				selectedDates.selections[key][date.created] = date;
			}
			daysBeingUpdated[key] = { 
																'day' : key,
																'time' : date.created 
															};
	};

	var getTotal = function () {
		var total = 0;
		angular.forEach(selectedDates.selections, function (day){
			total += Object.keys(day).length;
		});
		return total;
	};

	this.addDate = function (date) {
    // $timeout places the callback function in the next digest loop without interacting with the current loop
		$timeout(function(){
			addDate(date);
		});
	};

	this.addDates = function (arr) {
		$timeout(function () {
			angular.forEach(arr, function (date) {
				addDate(date);
			});
		});
	};

	this.getWeekTotal = function (week) {
		var total = 0;
		angular.forEach(week, function (day) {
			var key = getKey(day.date);
			if(selectedDates.selections[key]){
				total += Object.keys(selectedDates.selections[key]).length;
			}
		});
		return total;
	};


	this.getOutBounds = function (lowDate, highDate) {
		
		// get the key for first and last day in week list
		var lowKey = getKey(lowDate), highKey = getKey(highDate);
		var dayList = Object.keys(selectedDates.selections);

		var aboveCount = 0, belowCount = 0;

		for(var i = 0; i < dayList.length; i ++){
			if(dayList[i] < lowKey){
				belowCount += Object.keys(selectedDates.selections[dayList[i]]).length;
			} else if (dayList[i] > highKey){
				aboveCount += Object.keys(selectedDates.selections[dayList[i]]).length;
			}
		}
		
		return {above: aboveCount, below: belowCount};
	};

	this.getFirstSelection = function () {
		var keyList = Object.keys(selectedDates.selections);
		if(keyList.length){
			var firstDayKey = Object.keys(selectedDates.selections).sort()[0];
			var firstDay = selectedDates.selections[firstDayKey];
			var earliest;
			angular.forEach(firstDay, function (sel) {
				if(!earliest){
					earliest = sel;
				}
				if(sel.time < earliest.time){
					earliest = sel;
				}
			});
			return earliest;
		} else {
			return undefined;
		}
	};

	this.mouseUpEvent = function (week) {
		var self = this
		$timeout(function() {
			angular.forEach(daysBeingUpdated, function (day) {
				cleanUp(selectedDates.selections[day.day], day.time, day.day, selectedDates.selections);
			});
			daysBeingUpdated = {};
			var count = self.getWeekTotal(week);
			selectedDates.total = getTotal();
			$rootScope.$broadcast('addedSelection', count);
		});
	};

	this.updateWeek = function (week) {
		var self = this;
		$timeout(function() {
			var count = self.getWeekTotal(week);
			$rootScope.$broadcast('addedSelection', count);
		});
	};

	this.removeDate = function (date){
		$timeout(function() {
			var key = getKey(date.date);
			if(selectedDates.selections[key]){
				if(selectedDates.selections[key][date.created]){
					delete selectedDates.selections[key][date.created];
				}
			}
      // delete the whole bucket if its empty
			if(selectedDates.selections[key] && isEmptyObject(selectedDates.selections[key])){
				delete selectedDates.selections[key];
			}
			selectedDates.total --;
		});
	};

	this.getDate = function (date) {
		var key = getKey(date);
		return (selectedDates.selections[key] !== undefined) ? selectedDates.selections[key] : {};
	};

	this.getSelectedDates = function () {
		return selectedDates.selections;
	};

	this.getSelectedContainer = function () {
		return selectedDates;
	}


	this.save = function () {
		// selectionMethods.save(selectedDates);
	};
	
}]);