/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package cache
 * @version :  2017-04-05 16:06 $
 *
 * cache 代理类
 */

import { Cookie, LocalStorage } from './cache/'

const classes = { Cookie, LocalStorage }
const cached = {}

// 首字母大写
String.prototype.ucfirst = function () {
   return this.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}

export default class Cache{
    constructor(engine = 'localStorage') {
        engine = engine.ucfirst()
        let target = null

        if(engine in cached){
            target = cached[engine]
        }else{
            try{
                target = new classes[engine];
            }catch (err){
                throw new Error(`${engine} do not support.`)
            }
            cached[engine] = target
        }

        return new Proxy(target, {
                get: function (target, key, receiver) {
                    return Reflect.get(target, key, receiver);
        }});
    }
}
