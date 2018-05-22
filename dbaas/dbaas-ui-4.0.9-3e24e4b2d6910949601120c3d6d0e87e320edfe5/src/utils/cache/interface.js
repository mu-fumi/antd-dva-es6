/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package cache
 * @version :  2017-04-05 16:06 $
 *
 * cache 接口类,假装 es6/7 支持接口
 */

'use strict';

export default class Interface{

    constructor() {
        //if (new.target === Interface) {  /*用点的话，build的时候会报错*/
        //    throw new TypeError("Cannot construct Interface instances directly");
        //}
    }

    get(key, defaultValue){}

    put(key, value, minutes){}

    forget(key){}

    has(key){}

    flush() {}
}

