/**
 * Created by zhangmm on 2017/8/18.
 */
import { addClient } from 'services/cmdb'
import { Link , browserHistory } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'addClient',
  state:{
  },
  reducers:{
  },
  effects:{
    *addClient({payload} , {call}){
      let res = yield call(addClient , payload)
      if(res.code === 0){
        browserHistory.push('cmdb/client')
      }else{
        message.error(res.msg)
      }
    }
  },
  subscriptions:{
  }
}
