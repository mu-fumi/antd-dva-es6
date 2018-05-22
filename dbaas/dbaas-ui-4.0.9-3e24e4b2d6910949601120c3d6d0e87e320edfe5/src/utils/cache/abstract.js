/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package cache
 * @version :  2017-04-05 16:06 $
 *
 * cache 抽象类,继承接口,子类必须实现接口方法
 */

'use strict';

import Interface from './interface'

export default class Abstract extends Interface{
    constructor() {
        super();
        //if (new.target === Abstract) {   /*用点的话，build的时候会报错*/
        //    throw new TypeError("Cannot construct Abstract instances directly");
        //}
        this.prefix = 'dbaasV2'
    }

    static expires(time){
        return + new Date() > parseInt(time, 10)
    }
}
