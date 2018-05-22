/**
 * Created by zhangmm on 2017/9/13.
 */
import {  } from 'services/configs'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'configs',
  state:{
    placeholder : '根据关键词搜索配置',
    filter:{
      keyword : '',
      time: '',
    },
    visible:false,
    dataSource:[],
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
        filter:{
          ...state.filter,
          ...action.payload
        }
      }
    },
    handleModal (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleDataSource (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
  },
  effects:{
/*    *getHistory({payload} , {call , put}){
      let res = yield call(getHistory , payload)
      if(res.code === 0){
        //yield put({type:"handleReload"})
      }else{
        message.error(res.msg)
      }
    }*/
  },
  subscriptions:{
  }
}
