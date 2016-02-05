// Time helper class
class Time {
		constructor(public hours: number = 0, public minutes: number = 0, public seconds: number = 0) {
		}
		static Now(): Time {
				var now = new Date();
				return new Time(now.getHours(), now.getMinutes(), now.getSeconds());
		}

		addMinutes(amount: number) {
				this.minutes += amount;
				if (this.minutes >= 60 || this.minutes < 0) {
						this.addHours(Math.floor(this.minutes / 60));
						this.minutes %= 60;
				}
				if (this.minutes < 0) this.minutes += 60;
		}

		addHours(amount: number) {
				this.hours += amount;
				if (this.hours >= 24 || this.hours < 0) this.hours %= 24;
				if (this.hours < 0) this.hours += 24;
		}

		isGreaterThan(other: Time) {
				if (this.hours != other.hours) return this.hours > other.hours;
				if (this.minutes != other.minutes) return this.minutes > other.minutes;
				return this.seconds > other.seconds;
		}

		isLessThan(other: Time) {
				if (this.hours != other.hours) return this.hours < other.hours;
				if (this.minutes != other.minutes) return this.minutes < other.minutes;
				return this.seconds < other.seconds;
		}

		clone() {
				return new Time(this.hours, this.minutes, this.seconds);
		}

		differenceInSecondsTo(other: Time) {
				var secs =
						(other.seconds - this.seconds) +
						(other.minutes - this.minutes) * 60 +
						(other.hours - this.hours) * 3600;
				return secs < 0 ? secs + 86400 : secs;
		}
}


// Timer class
class Timer {
		seconds: number;

		constructor(seconds: number, minutes: number = 0, hours: number = 0) {
				this.seconds = seconds + minutes * 60 + hours * 3600;
		}

		tickDown() {
				this.seconds--;
		}

		show(): string {
			var hours = Math.floor(this.seconds / 3600);
			var minutes = Math.floor((this.seconds % 3600) / 60);
			var seconds = Math.floor(this.seconds % 60);

			var hoursString = hours > 0 ? hours + " time" + ((hours > 1) ? "r" : "") : null;
			var minutesString = minutes > 0 ? minutes + " minut" + ((minutes > 1) ? "ter": ""): null;
			var secondsString = seconds > 0 ? seconds + " sekund" + ((seconds > 1) ? "er" : "") : null;

			var arr = [hoursString, minutesString, secondsString].filter(x => x != null);
			var last = arr.pop();

			if (!last) return "NU!";
			return (arr.length > 0) ? arr.join(", ") + " og " + last : last;
		}

		start(el: HTMLElement, callback) {
				el.innerHTML = this.show();
				var timeinterval = setInterval(() => {
						this.tickDown();
						el.innerHTML = this.show();
						if (this.seconds <= 0) {
								clearInterval(timeinterval);
								callback();
						}
				}, 1000);
		}
}



// Generate the timetable
var trainMinutes = [6, 16, 26, 36, 46, 56];
var trainMinutesOffHour = [16, 36, 56];
var bufferMinutes = 5;

var timeTable: Time[] = [];

// Populate time table
var time = new Time(5, 16);
while (time.hours > 0 || (time.hours == 0 && time.minutes <= 36)) {
		timeTable.push(time.clone());
		time.addMinutes(20);
}

time = new Time(6, 6);
var endTime = new Time(18, 47);
while (time.isLessThan(endTime)) {
		timeTable.push(time.clone());
		time.addMinutes(20);
}

// Add buffer minutes and sort the time table
timeTable.map(t => t.addMinutes(-bufferMinutes));
timeTable = timeTable.sort((a, b) => a.isGreaterThan(b) ? 1 : -1);




// Function to help find next train time
function getTimerUntilNext(): Timer {
		var currentTime = Time.Now();
		var i = 0;
		while (i < timeTable.length && currentTime.isGreaterThan(timeTable[i])) i++;
		if (i == timeTable.length) i = 0;
		return new Timer(currentTime.differenceInSecondsTo(timeTable[i]));
}



// Start a new timer
function startNewTimer() {
		var el = document.getElementById("timer");
		var timer = getTimerUntilNext();
		timer.start(el, startNewTimer);
}


// Window onload
window.onload = () => {
		startNewTimer();
}









