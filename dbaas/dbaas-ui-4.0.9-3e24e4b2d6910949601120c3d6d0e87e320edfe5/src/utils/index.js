import request from './request'
import classnames from 'classnames'
import Cache from './cache'
import Logger from './logger'
import constant from './constant'
import Gate from './gate'
import * as moment from 'moment'

// 连字符转驼峰
String.prototype.hyphenToHump = function () {
  // replace(替换的正则/子字符串，函数)
  return this.replace(/-(\w)/g, (...args) => {
    return args[1].toUpperCase()
  })
}

// 驼峰转连字符
String.prototype.humpToHyphen = function () {
  return this.replace(/([A-Z])/g, '-$1').toLowerCase()
}

String.prototype.parseInt = function () {
  return isNaN(parseInt(this)) ? 0 : parseInt(this)
}

String.prototype.ltrim = function (chars) {
  chars = chars || '\\s';
  return this.replace(new RegExp('^[' + chars + ']+', 'g'), '')
}

String.prototype.rtrim = function (chars) {
  chars = chars || '\\s';
  return this.replace(new RegExp('[' + chars + ']+$', 'g'), '')
}

String.prototype.trim = function (chars) {
  return this.rtrim(chars).ltrim(chars)
}

// 日期格式化
Date.prototype.format = function (format) {
  const o = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'h+': this.getHours(),
    'H+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth() + 3) / 3),
    S: this.getMilliseconds(),
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, `${this.getFullYear()}`.substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : (`00${o[k]}`).substr(`${o[k]}`.length))
    }
  }
  return format
}

const radioToPicker = (radioTime) => {
  let pickerTime = []
  switch (radioTime) {
    case 'last_30_minutes':  // string转时间戳转moment数组
      pickerTime = [moment.unix((+new Date()) / 1000 - 30 * 60), moment.unix((+new Date()) / 1000)]
      break
    case 'last_3_hours':
      pickerTime = [moment.unix((+new Date()) / 1000 - 3 * 60 * 60), moment.unix((+new Date()) / 1000)]
      break
    case 'last_12_hours':
      pickerTime = [moment.unix((+new Date()) / 1000 - 12 * 60 * 60), moment.unix((+new Date()) / 1000)]
      break
    case 'last_24_hours':
      pickerTime = [moment.unix((+new Date()) / 1000 - 24 * 60 * 60), moment.unix((+new Date()) / 1000)]
      break
    case 'last_1_days':
      pickerTime = [moment.unix((+new Date()) / 1000 - 24 * 60 * 60), moment.unix((+new Date()) / 1000)]
      break
    case 'last_7_days':
      pickerTime = [moment.unix((+new Date()) / 1000 - 7 * 24 * 60 * 60), moment.unix((+new Date()) / 1000)]
      break
    case 'last_30_days':
      pickerTime = [moment.unix((+new Date()) / 1000 - 30 * 24 * 60 * 60), moment.unix((+new Date()) / 1000)]
      break
  }
  return pickerTime
}

const disabledDate = (current) => {
  // console.log(current, current.valueOf())
  if (current && current.valueOf() > Date.now()) {
    return true;
  }
  else {

    let date = new Date();
    let y = date.getFullYear();
    let m = date.getMonth();
    let d = date.getDate();
    if (m == 0) {
      y--;
      m = 12;
    }

    return current && current.valueOf() < new Date(`${y}-${m}-${d}`).getTime();
  }
}

class TimeFilter {
  static toUnix(time) { // 232323-2323
    return (time.map((m) => {
      return m.unix()
    })).join('-')
  }

  static parse(time) { //radio or picker
    let radioTime = time, pickerTime = time
    if (time.split('-').length === 2) {
      radioTime = null
      pickerTime = time.split('-').map((v) => (  moment.unix(v) ))
    } else {  // radio选中时同步给picker，各页面picker的defaultValue设置为pickerTime值，并添加key以便重新渲染defaultValue
      pickerTime = radioToPicker(time)
    }
    return {radio: radioTime, picker: pickerTime}
  }

  static format(unixTime, format = 'YYYY-MM-DD HH:mm:ss') {
    return moment.unix(unixTime).format(format)
  }
}

const convertUnit = (num, unit) => {
  const arr = ['T','G', 'M', 'K']

  if (num < 1024) {
    return num + unit
  } else {
    let n = parseInt(num / 1024)
    let i = arr.indexOf(unit)
    if(i > 1){
      const newUnit = arr[i - 1]
      return convertUnit(n, newUnit)
    }
  }
}

module.exports = {
  request,
  classnames,
  Logger,
  Cache,
  constant,
  radioToPicker,
  disabledDate,
  TimeFilter,
  Gate,
  convertUnit
}
