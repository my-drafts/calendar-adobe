
(
  function(global) {
    'use strict';

    var dateFormat = (function() {
        var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZWN]|'[^']*'|'[^']*'/g;
        var timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;
        var timezoneClip = /[^-+\dA-Z]/g;
    
        // Regexes and supporting functions are cached through closure
        return function (date, mask, utc, gmt) {
    
          // You can't provide utc if you skip other args (use the 'UTC:' mask prefix)
          if (arguments.length === 1 && kindOf(date) === 'string' && !/\d/.test(date)) {
            mask = date;
            date = undefined;
          }
    
          date = date || new Date;
    
          if(!(date instanceof Date)) {
            date = new Date(date);
          }
    
          if (isNaN(date)) {
            throw TypeError('Invalid date');
          }
    
          mask = String(dateFormat.masks[mask] || mask || dateFormat.masks['default']);
    
          // Allow setting the utc/gmt argument via the mask
          var maskSlice = mask.slice(0, 4);
          if (maskSlice === 'UTC:' || maskSlice === 'GMT:') {
            mask = mask.slice(4);
            utc = true;
            if (maskSlice === 'GMT:') {
              gmt = true;
            }
          }
    
          var _ = utc ? 'getUTC' : 'get';
          var d = date[_ + 'Date']();
          var D = date[_ + 'Day']();
          var m = date[_ + 'Month']();
          var y = date[_ + 'FullYear']();
          var H = date[_ + 'Hours']();
          var M = date[_ + 'Minutes']();
          var s = date[_ + 'Seconds']();
          var L = date[_ + 'Milliseconds']();
          var o = utc ? 0 : date.getTimezoneOffset();
          var W = getWeek(date);
          var N = getDayOfWeek(date);
          var flags = {
            d:    d,
            dd:   pad(d),
            ddd:  dateFormat.i18n.dayNames[D],
            dddd: dateFormat.i18n.dayNames[D + 7],
            m:    m + 1,
            mm:   pad(m + 1),
            mmm:  dateFormat.i18n.monthNames[m],
            mmmm: dateFormat.i18n.monthNames[m + 12],
            yy:   String(y).slice(2),
            yyyy: y,
            h:    H % 12 || 12,
            hh:   pad(H % 12 || 12),
            H:    H,
            HH:   pad(H),
            M:    M,
            MM:   pad(M),
            s:    s,
            ss:   pad(s),
            l:    pad(L, 3),
            L:    pad(Math.round(L / 10)),
            t:    H < 12 ? dateFormat.i18n.timeNames[0] : dateFormat.i18n.timeNames[1],
            tt:   H < 12 ? dateFormat.i18n.timeNames[2] : dateFormat.i18n.timeNames[3],
            T:    H < 12 ? dateFormat.i18n.timeNames[4] : dateFormat.i18n.timeNames[5],
            TT:   H < 12 ? dateFormat.i18n.timeNames[6] : dateFormat.i18n.timeNames[7],
            Z:    gmt ? 'GMT' : utc ? 'UTC' : (String(date).match(timezone) || ['']).pop().replace(timezoneClip, ''),
            o:    (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
            S:    ['th', 'st', 'nd', 'rd'][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10],
            W:    W,
            N:    N
          };
    
          return mask.replace(token, function (match) {
            if (match in flags) {
              return flags[match];
            }
            return match.slice(1, match.length - 1);
          });
        };
      })();

    dateFormat.masks = {
      'default':               'ddd mmm dd yyyy HH:MM:ss',
      'shortDate':             'm/d/yy',
      'mediumDate':            'mmm d, yyyy',
      'longDate':              'mmmm d, yyyy',
      'fullDate':              'dddd, mmmm d, yyyy',
      'shortTime':             'h:MM TT',
      'mediumTime':            'h:MM:ss TT',
      'longTime':              'h:MM:ss TT Z',
      'isoDate':               'yyyy-mm-dd',
      'isoTime':               'HH:MM:ss',
      'isoDateTime':           'yyyy-mm-dd\'T\'HH:MM:sso',
      'isoUtcDateTime':        'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\'',
      'expiresHeaderFormat':   'ddd, dd mmm yyyy HH:MM:ss Z'
    };

    // Internationalization strings
    dateFormat.i18n = {
      dayNames: [
        'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      ],
      monthNames: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
      ],
      timeNames: [
        'a', 'p', 'am', 'pm', 'A', 'P', 'AM', 'PM'
      ]
    };

    function pad(val, len) {
      val = String(val);
      len = len || 2;
      while (val.length < len) {
        val = '0' + val;
      }
      return val;
    };

    /**
     * Get the ISO 8601 week number
     * Based on comments from
     * http://techblog.procurios.nl/k/n618/news/view/33796/14863/Calculate-ISO-8601-week-and-year-in-javascript.html
     *
     * @param  {Object} `date`
     * @return {Number}
     */
    function getWeek(date) {
      // Remove time components of date
      var targetThursday = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      // Change date to Thursday same week
      targetThursday.setDate(targetThursday.getDate() - ((targetThursday.getDay() + 6) % 7) + 3);

      // Take January 4th as it is always in week 1 (see ISO 8601)
      var firstThursday = new Date(targetThursday.getFullYear(), 0, 4);

      // Change date to Thursday same week
      firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);

      // Check if daylight-saving-time-switch occurred and correct for it
      var ds = targetThursday.getTimezoneOffset() - firstThursday.getTimezoneOffset();
      targetThursday.setHours(targetThursday.getHours() - ds);

      // Number of weeks between target Thursday and first Thursday
      var weekDiff = (targetThursday - firstThursday) / (86400000*7);
      return 1 + Math.floor(weekDiff);
    }

    /**
     * Get ISO-8601 numeric representation of the day of the week
     * 1 (for Monday) through 7 (for Sunday)
     * 
     * @param  {Object} `date`
     * @return {Number}
     */
    function getDayOfWeek(date) {
      var dow = date.getDay();
      if(dow === 0) {
        dow = 7;
      }
      return dow;
    }

    /**
     * kind-of shortcut
     * @param  {*} val
     * @return {String}
     */
    function kindOf(val) {
      if (val === null) {
        return 'null';
      }

      if (val === undefined) {
        return 'undefined';
      }

      if (typeof val !== 'object') {
        return typeof val;
      }

      if (Array.isArray(val)) {
        return 'array';
      }

      return {}.toString.call(val)
        .slice(8, -1).toLowerCase();
    };


    if (typeof define === 'function' && define.amd) {
      define(function () {
        return dateFormat;
      });
    } else if (typeof exports === 'object') {
      module.exports = dateFormat;
    } else {
      global.dateFormat = dateFormat;
    }
  }
)(this);
// ===


Array.prototype.filter = function(f) {
  var result = [];
  if (f instanceof Function) {
    for (var id=0, L=this.length; id < L; id++) {
      var el = this[id];
      if (f(el, id, this)) {
        result.push(el);
      }
    }
  }
  return result;
};
Array.prototype.map = function(f) {
  var result = [];
  if (f instanceof Function) {
    for (var id=0, L=this.length; id < L; id++) {
      var el = this[id];
      result.push(f(el, id, this));
    }
  }
  return result;
};
Array.prototype.reduce = function(f, init) {
  var result = init;
  if (f instanceof Function) {
    for (var id=0, L=this.length; id < L; id++) {
      var el = this[id];
      result = f(result, el, id, this);
    }
  }
  return result;
};
Array.prototype.size = function(size, value) {
  return Array.apply(null, Array(Math.max(0, size))).map(function(el){ return value; });
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


$.writeln("---");
/** / 
var calender = []
  .size(12)
  .map(function(el, id){
    return id+1;
  })
  .map(function(month){
    var YEAR = 2018;
    var date = new Date(YEAR, month-1, 1);
    return [date, date.daysInMonth()];
//    return [date, [].size(date.daysInMonth())];
  })
  .map(function(el){
    var FORMAT = "dd/mm/yyyy ";
    return [el[0].format(FORMAT), el[1], "\t"];
  });
$.writeln(calender);
/**/

/** /
var x = [1, 2, 3, 4, 5].reduce(function(prev, el, index){
  return prev + el;
}, 10);
$.writeln(x);
/**/

/** /
var X = [2018,10,1];
var x = new Date(X[0], X[1], X[2]);
var Y = -1;
var y = x.addMonth(Y);
var F = "dd/mm/yyyy HH:MM:ss";
$.writeln("---");
$.writeln("x: ", X, " = ", Number(x));
$.writeln("y: ", Y, " = ", Number(y));
$.writeln("x in format : ", x.format(F));
$.writeln("y in format : ", y.format(F));
/**/

/** /
var X = [2018,9,1];
var x = new Date(X[0], X[1], X[2]);
var F = "dd / mm / yyyy";
$.writeln("---");
$.writeln("x : ", x.format(F));
$.writeln("x daysInMonth : ", x.daysInMonth());
/**/