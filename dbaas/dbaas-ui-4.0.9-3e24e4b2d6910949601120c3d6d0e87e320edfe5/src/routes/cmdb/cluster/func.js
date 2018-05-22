/**
 * Created by wengyian on 2017/11/9.
 */

import Json from 'utils/json'

export default class Func {
  static splitMem (str) {
    let num = 0;
    let unit = ''
    if (str) {
      num = parseFloat(str)
      unit = str.replace(num, '')
    }
    return {
      num,
      unit,
      oldVal : str
    }
  }

  static convertToG (object) {
    const units = ['TB', 'GB', 'MB', 'KB']
    // let obj = Json.loads(json)
    let obj = {...object}
    const index = units.indexOf(obj.unit)
    if (index === -1) {
      return obj
    } else {
      let num = obj.num
      const n = 1 - index
      num = num * Math.pow(1024, n)
      return {
        num,
        unit: 'G',
        oldVal : obj.oldVal
      }
    }
  }

  static getColor (num) {
    let className = ''
    switch (true) {
      case num < 30 :
        className = 'text-success'
        break
      case num < 80 :
        className = 'text-info'
        break
      case num < 90 :
        className = 'text-warning'
        break
      case num >= 90 :
        className = 'text-error'
        break
    }
    return className
  }

  static getMonitorClass(val){
    let className = ''
    if(val !== undefined){
      switch (val.toUpperCase()) {
        case 'OFF' :
        case '节点不可达' :
        case 'OFFLINE' :
          className = 'text-error'
          break
        case 'ON' :
        case 'ONLINE' :
          className = 'text-success'
          break
      }
    }

    return className
  }
}
