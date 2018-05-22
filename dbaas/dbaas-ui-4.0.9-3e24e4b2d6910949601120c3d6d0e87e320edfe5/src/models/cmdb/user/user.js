/**
 * Created by zhangmm on 2017/8/28.
 */
import { deleteUser } from 'services/cmdb'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'user',
  state:{
    placeholder : '根据用户名、昵称搜索',
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
    handleKeyword (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    resetFilter(state) {
      return {
        ...state,
        keyword : ''
      }
    },
  },
  effects:{
    *deleteUser({payload} , {call , put}){
      let res = yield call(deleteUser , payload)
      if(res.code === 0){
        yield put({type:"handleReload"})
        message.success('用户删除成功')
      }else{
        message.error(res.msg)
      }
    }
  },
  subscriptions:{
  }
}
