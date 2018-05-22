/**
 * Created by zhangmm on 2017/9/7.
 */
import {  } from 'services/cmdb'

export default {
  namespace:'job',
  state:{
    placeholder : '根据关键词搜索任务',
    keyword : '',
    time:'today',
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
    handleTimeFilter (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
  },
  effects:{
/*    *deleteApp({payload} , {call , put}){
      let res = yield call(deleteApp , payload)
      if(res.code === 0){
        yield put({type:"handleReload"})
      }else{
        message.error(res.msg)
      }
    }*/
  },
  subscriptions:{
  }
}
