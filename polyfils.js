
/** /
if (typeof(Array.prototype.filter)!=='function') {
	Array.prototype.filter = function(callBack, that) {
		if (typeof(callBack)!=='function') return this;
		let result = [];
		for (let i=0; i<this.length; i++) {
			let el = this[i];
			let owner = arguments.length>1 ? that : el;
			if (!callBack.call(owner, el, i, this)) continue;
			result.push(el);
		}
		return result;
	}
}
/**/

/** /
if (typeof(Array.prototype.map)!=='function') {
	Array.prototype.map = function(callBack, that) {
		if (typeof(callBack)!=='function') return this;
		let result = [];
		for (let i=0; i<this.length; i++) {
			let el = this[i];
			let owner = arguments.length>1 ? that : el;
			result.push(callBack.call(owner, el, i, this));
		}
		return result;
	}
}
/**/

/** /
if (typeof(Array.prototype.reduce)!=='function') {
	Array.prototype.reduce = function(callBack, initialValue) {
		if (typeof(callBack)!=='function') return this;
		if (arguments.length>1) {
			let result = initialValue;
			for (let i=0; i<this.length; i++) {
				let el = this[i];
				result = callBack(result, el, i, this);
			}
			return result;
		}
		else {
			let result = this[0];
			for (let i=1; i<this.length; i++) {
				let el = this[i];
				result = callBack(result, el, i, this);
			}
			return result;
		}
	}
}
/**/

/** /
if (typeof(Array.prototype.concat)!=='function') {
	Array.prototype.concat = function() {
		let result = [];
		for (let i=0; i<this.length; i++) result.push(this[i]);
		for (let i=0; i<arguments.length; i++) {
			if (arguments[i] instanceof Array) {
				for (let j=0; j<arguments[i].length; j++) result.push(arguments[i][j]);
			}
			else result.push(arguments[i]);
		}
		return result;
	}
}
/**/

/** /
if (typeof(Array.prototype.size)!=='function') {
	Array.prototype.size = function(size, initialValue) {
		size = Number(size);
		size = isNaN(size) ? 0 : size;
		size = Math.max(0, size - this.length);
		let map = function(el) {
			return initialValue;
		};
		let array = Array(size);
		return this.concat(Array.apply(null, array).map(map));
	}
}
/**/


Date.prototype.parsed2init = function(parsed) {
	let result = [];
	if (isNaN(parsed.year)) return result;
	result.push(parsed.year);
	if (isNaN(parsed.month)) return result;
	result.push(parsed.month);
	if (isNaN(parsed.day)) return result;
	result.push(parsed.day);
	if (isNaN(parsed.hour)) return result;
	result.push(parsed.hour);
	if (isNaN(parsed.minute)) return result;
	result.push(parsed.minute);
	if (isNaN(parsed.second)) return result;
	result.push(parsed.second);
	if (isNaN(parsed.millisecond)) return result;
	result.push(parsed.millisecond);
	return result;
};

console.log((new Date()).parsed2init({year:2017, month:2, millisecond:343}));

Date.prototype.parsed = function (date, format) {
	let result = [];
	let year = 1, month = 1, day = 1, hour = 1, minute = 1, second = 1, millisecond = 1;
	if (year) result.push({ year: year });
	if (month) result.push({ month: month });
	if (day) result.push({ day: day });
	if (hour) result.push({ hour: hour });
	if (minute) result.push({ minute: minute });
	if (second) result.push({ second: second });
	if (millisecond) result.push({ millisecond: millisecond });
	return Object.assign.apply({}, result);
}

Date.prototype.init = function() {
	let a = arguments;
	switch (a.length) {
		case 0: 
			return new Date();
		case 1:
			if (a[0] instanceof Array) return new Date.apply(null, a[0]);
			throw new ErrorType('Date.init with one non-Array argument');
		case 2:
			try{
				let parsed = Date.parsed(a[0], a[1]);
				let parsed2init = Date.parsed2init(parsed);
				return new Date.init(parsed2init);
			}
			catch (E) {
				throw E;
			}
		case 3:
		case 4:
		case 5:
		case 6:
		case 7:
			return Date.init(arguments);
		default:
			throw new ErrorType('Date.init with too many arguments');
	}
}

/** /
Date.prototype.milliseconds = function() {
  return this.getMilliseconds(); // 0-999
};
Date.prototype.day = function() {
  return this.getDate(); // 1-31
};
Date.prototype.format = function(format) {
  return dateFormat(Number(this), format);
};
Date.prototype.month = function() {
  return this.getMonth()+1; // 1-12
};
Date.prototype.toNumber = function() {
  return this.getTime(); // TimeStamp
};
Date.prototype.weekDay = function() {
  return (this.getDay()+6)%7 + 1; // 1:mo-7:sa
};
Date.prototype.year = function() {
  return this.getFullYear(); // 1970-XXXX
};
Date.prototype.add = function(msecond) {
  msecond = Number(msecond);
  msecond = isNaN(msecond) ? 1 : msecond);
  return new Date(Number(this) + msecond);
};
Date.prototype.addSecond = function(second) {
  second = Number(second);
  second = isNaN(second) ? 1 : second;
  return this.add(second * 1000);
};
Date.prototype.addMinute = function(minute) {
  minute = Number(minute);
  minute = isNaN(minute) ? 1 : minute;
  return this.addSecond(minute * 60);
};
Date.prototype.addHour = function(hour) {
  hour = Number(hour);
  hour = isNaN(hour) ? 1 : hour;
  return this.addMinute(hour * 60);
};
Date.prototype.addDay = function(day) {
  day = Number(day);
  day = isNaN(day) ? 1 : day;
  return this.addHour(day * 24);
};
Date.prototype.addMonth = function(month) {
  month = Number(month);
  month = isNaN(month) ? 1 : month;
  var dayOfMonth = this.day();
  var cursor = this;
  while (month!=0) {
    if (month>0) {
      month--;
      cursor = cursor.nextMonth();
    }
    else {
      month++;
      cursor = cursor.prevMonth();
    }
  }
	var x = cursor.daysInMonth();
  var offset = Math.min(dayOfMonth - 1, x - 1);
  return cursor.addDay(offset);
};
Date.prototype.daysInMonth = function() {
  return [].size(31, { y:this.year(), m:this.month() }).filter(function (v, d) {
    return (new Date(v.y, v.m, d)).month()===v.m;
  }).length;
};
Date.prototype.daysLeftInMonth = function() {
  return this.daysInMonth() - this.day();
};
Date.prototype.prevMonth = function() {
  var cursor = this.addDay(-1*this.day());
  return cursor.addDay(-1*cursor.day() + 1);
};
Date.prototype.nextMonth = function() {
  return this.addDay(this.daysLeftInMonth() + 1);
};
/**/
