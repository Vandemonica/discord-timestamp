function alpine_container() {
  return {
    data: {
      open_tab: 0,
      user: {
        day: 'Sunday',
        date: '01 Jan 1970',
        time: '00:00:00',
        timezone: '',
        utc: '',
        offset: null
      },
      picked: {
        day: 'Sunday',
        date: '01 Jan 1970',
        time: '00:00:00',
        utc: '',
        relative_time: ''
      },
      timezones: data_utc,
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      timestamps: [
        {
          id: 't',
          type: 'Short Time'
        }, {
          id: 'T',
          type: 'Long Time'
        }, {
          id: 'd',
          type: 'Short Date'
        }, {
          id: 'D',
          type: 'Long Date'
        }, {
          id: 'f',
          type: 'Short Datetime'
        }, {
          id: 'F',
          type: 'Long Datetime'
        }
      ]
    },
    init() {
      this.initTime();
      this.updateTime();
    },
    initTime() {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const offset = (new Date().getTimezoneOffset() / 60) * -1;
      const utc = (offset >= 0 ? '+' : '-') + this.padNumber(Math.abs(offset)) + ':00';

      const date = new Date();
      const data = this.getTime(date);

      this.data.user.timezone = timezone;
      this.data.user.offset = offset;
      this.data.user.utc = utc;

      this.data.user.day = data.day;
      this.data.user.date = data.date;
      this.data.user.time = data.time;

      this.data.picked.utc = utc;
      this.data.picked.day = data.day;
      this.data.picked.date = data.date;
      this.data.picked.time = data.time;

      setInterval(() => {
        const d = new Date(this.data.picked.date + ' ' + this.data.picked.time + ' ' + this.data.picked.utc);
        const now = new Date();
        const x = this.getTime(now);

        this.data.user.day = x.day;
        this.data.user.date = x.date;
        this.data.user.time = x.time;

        this.data.picked.relative_time = this.getRelativeTime(d, now);
      }, 1000);
    },
    getEpoch() {
      return Math.floor(
        new Date(this.data.picked.date + ' ' + this.data.picked.time + ' ' + this.data.picked.utc).getTime() / 1000
      );
    },
    getFormatValue(id, isAnalogue) {
      const d = new Date(this.data.picked.date + ' ' + this.data.picked.time + ' ' + this.data.picked.utc);
      const data = this.getTime(d);

      if (id == 't') {
        return isAnalogue ? this.formatToAnalogue(d, false) : data.time.substring(0, 5);

      } else if (id == 'T') {
        return isAnalogue ? this.formatToAnalogue(d, true) : data.time;

      } else if (id == 'd') {
        const m = this.padNumber(data.sequential.m + 1);
        return isAnalogue ? m + '/' + data.sequential.d + '/' + data.sequential.y : data.sequential.d + '/' + m + '/' + data.sequential.y;

      } else if (id == 'D') {
        const m = this.data.months[data.sequential.m];
        return isAnalogue ? m + ' ' + data.sequential.d + ', ' + data.sequential.y : data.sequential.d + ' ' + m + ' ' + data.sequential.y;

      } else if (id == 'f') {
        const m = this.data.months[data.sequential.m];

        let date = null; let time = null;
        if (isAnalogue) {
          date = m + ' ' + data.sequential.d + ', ' + data.sequential.y;
          time = this.formatToAnalogue(d, false);
        } else {
          date = data.sequential.d + ' ' + m + ' ' + data.sequential.y;
          time = this.getTime(d).time.substring(0, 5);
        }

        return date + ' ' + time;

      } else if (id == 'F') {
        const m = this.data.months[data.sequential.m];

        let date = null; let time = null;
        if (isAnalogue) {
          date = m + ' ' + data.sequential.d + ', ' + data.sequential.y;
          time = this.formatToAnalogue(d, false);
        } else {
          date = data.sequential.d + ' ' + m + ' ' + data.sequential.y;
          time = this.getTime(d).time.substring(0, 5);
        }

        return data.day + ', ' + date + ' ' + time;

      }

      return 'Invalid';
    },
    getTime(d) {
      const days = this.padNumber(d.getDate());
      const months = d.getMonth();
      const years = d.getFullYear();

      const hours = this.padNumber(d.getHours());
      const minutes = this.padNumber(d.getMinutes());
      const seconds = this.padNumber(d.getSeconds());

      const time = hours + ':' + minutes + ':' + seconds;

      return {
        day: this.data.days[d.getDay()],
        date: days + ' ' + this.data.months[months] + ' ' + years,
        time: time,
        rawDate: years + '-' + this.padNumber(months + 1) + '-' + days,
        rawTime: time,
        sequential: {
          d: days,
          m: months,
          y: years,
          h: hours,
          i: minutes,
          s: seconds
        }
      };
    },
    getRelativeTime(d, now) {
      const ms = 1000;
      const msPerMinute = 60 * ms;
      const msPerHour = msPerMinute * 60;
      const msPerDay = msPerHour * 24;
      const msPerMonth = msPerDay * 30;
      const msPerYear = msPerDay * 365;

      const delta = Math.abs(now.getTime() - d.getTime());

      let definer = '';
      let value = '';
      let prefix = 'in ';
      let postfix = '';

      if (now >= d) {
        prefix = '';
        postfix = ' ago';
      }

      if (delta < msPerMinute) {
        value = Math.round(delta / ms);
        definer = value <= 1 ? 'a second' : ' seconds';

      } else if (delta < msPerHour) {
        value = Math.round(delta / msPerMinute);
        definer = value <= 1 ? 'a minute' : ' minutes';

      } else if (delta < msPerDay) {
        value = Math.round(delta / msPerHour);
        definer = value <= 1 ? 'an hour' : ' hours';

      } else if (delta < msPerMonth) {
        value = Math.round(delta / msPerDay);
        definer = value <= 1 ? 'a day' : ' days';

      } else if (delta < msPerYear) {
        value = Math.round(delta / msPerMonth);
        definer = value <= 1 ? 'a month' : ' months';

      } else {
        value = Math.round(delta / msPerYear);
        definer = value <= 1 ? 'a year' : ' years';
      }

      return prefix + (value > 1 ? value : '') + definer + postfix;
    },
    updateField(id, fieldValue, isHasDataValue) {
      const elems = document.querySelectorAll('.field-' + id);

      let dataValue = fieldValue;
      if (isHasDataValue) {
        const d = new Date(fieldValue);
        dataValue = this.getTime(d)[id];
      }

      this.data.picked[id] = dataValue;
      elems.forEach((item) => {
        item.value = fieldValue;
      });
    },
    updateTime() {
      const d = new Date();
      const data = this.getTime(d);

      this.updateField('date', data.rawDate, true);
      this.updateField('time', data.rawTime, false);
    },
    formatToAnalogue(date, isLong) {
      let h = date.getHours();

      const period = h >= 12 ? 'PM' : 'AM';

      h = h % 12;
      const hours = h ? h : 12;
      const minutes = this.padNumber(date.getMinutes());

      if (isLong) {
        const seconds = this.padNumber(date.getSeconds());
        return hours + ':' + minutes + ':' + seconds + ' ' + period;
      }

      return hours + ':' + minutes + ' ' + period;
    },
    padNumber(number) {
      return (number.toString().length < 2 ? ('0' + number) : number);
    },
    copyBlock(elem) {
      const value = elem.innerText;
      navigator.clipboard.writeText(value).then(function () {
        alert("Copied to clipboard");
      });
    }
  };
}