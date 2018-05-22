/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-06-20 11:26 $
 */

import Cache from './cache'

const cache = new Cache()
const cached = {}

export default class Gate {
  /**
   * 有一个不允许则不行,支持多个权限,以逗号分隔,
   * @param permission
   * @returns {boolean}
   */
  static can(permission:string) {
    if(permission in cached){
      return cached[permission]
    }
    let can = true
    const all = cache.get('permissions')
    const permissions = permission.split(',')

    for(let i=0; i < permissions.length; i++){
      if(all.indexOf(permissions[i]) < 0){
        // 说明没有
        can = false
        break
      }
    }
    cached[permission] = can

    return can
  }
}