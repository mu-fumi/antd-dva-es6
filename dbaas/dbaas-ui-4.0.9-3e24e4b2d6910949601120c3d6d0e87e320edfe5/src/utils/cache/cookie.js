/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package cache
 * @version :  2017-04-05 16:06 $
 *
 * Cookie 实现 cache 类的几个方法
 */

import * as Cookies from "js-cookie"
import Abstract from './abstract'
import Logger from 'utils/logger'

export default class Cookie extends Abstract {

  get(key, defaultValue) {
    key = `${this.prefix}.${key}`
    let value = Cookies.getJSON(key)

    Logger.debug('util.cache.cookie.get: key ===>', key)
    Logger.debug('util.cache.cookie.get: value ===>', value)

    return value
  }

  put(key, value, minutes, attributes) {
    key = `${this.prefix}.${key}`
    minutes = minutes || 0
    attributes = attributes || {}

    if(minutes !== 0){
      attributes['expires'] = minutes / (60 * 24)
    }

    Logger.debug('util.cache.cookie.put: key ===>', key)
    Logger.debug('util.cache.cookie.put: value ===>', value)
    Logger.debug('util.cache.cookie.put: attributes ===>', attributes)

    Cookies.set(key, value, attributes)
  }

  forget(key) {
    key = `${this.prefix}.${key}`
    return Cookies.remove(key)
  }

  has(key) {
    return this.get(key) !== undefined
  }

  flush() {
    const cookies = document.cookie ? document.cookie.split('; ') : []
    const rdecode = /(%[0-9A-Z]{2})+/g

    Logger.debug('util.cache.cookie.flush: all cookies ===>', cookies)

    cookies.map((v)=> {
      let parts = v.split('=');
      try {
        let key = parts[0].replace(rdecode, decodeURIComponent).replace(`${this.prefix}.`, '')

        Logger.debug('util.cache.cookie.flush: get cookie key ===>', key)
        if (key) {
          this.forget(key)
        }
      } catch (err) {
        Logger.debug('util.cache.cookie.flush: get err ===>', err)
      }
    })
  }
}