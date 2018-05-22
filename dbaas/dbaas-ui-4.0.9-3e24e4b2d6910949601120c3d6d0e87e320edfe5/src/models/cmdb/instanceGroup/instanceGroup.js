/**
 * Created by zhangmm on 2017/8/29.
 */
import { deleteInstanceGroup } from 'services/cmdb'
import { Link , browserHistory } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'instanceGroup',
  state:{
    placeholder : '根据关键词搜索实例组',
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
    *deleteInstanceGroup({payload} , {call , put}){
      let res = yield call(deleteInstanceGroup , payload)
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
