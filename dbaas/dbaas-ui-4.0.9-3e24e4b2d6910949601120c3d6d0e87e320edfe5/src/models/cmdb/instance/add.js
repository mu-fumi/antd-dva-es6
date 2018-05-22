/**
 * Created by zhangmm on 2017/9/28.
 */
import { addInstance } from 'services/cmdb'
import { Link , browserHistory } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'addInstance',
  state:{
  },
  reducers:{
  },
  effects:{
    *addInstance({payload} , {call}){
      let res = yield call(addInstance , payload)
      if(res.code === 0){
        browserHistory.push('cmdb/instance')
      }else{
        message.error(res.msg)
      }
    },
  },
  subscriptions:{
  }
}
