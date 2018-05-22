/**
 * Created by zhangmm on 2017/8/8.
 */
import { deleteClient } from 'services/cmdb'
import { Link , browserHistory } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'client',
  state:{
    placeholder : '根据关键词搜索客户',
    keyword : '',
    reload:(+ new Date())
  },
  reducers:{
    handleReload:(state) => {
      return {
        ...state,
        reload:(+ new Date())
      }
    },
    handleFilter (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
  },
  effects:{
    *deleteClient({payload} , {call , put}){
      let res = yield call(deleteClient , payload)
      if(res.code === 0){
        yield put({type:"handleReload"})
      }else{
        message.error(res.msg)
      }
    }
  },
  subscriptions:{
  }
}
