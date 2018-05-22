/**
 * Created by zhangmm on 2017/9/1.
 */
import { addApp, getUsers, getBusinesses } from 'services/cmdb'
//import { Link , browserHistory } from 'dva/router'
import { routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'addApp',
  state:{
    /*users:[],*/
    businesses:[],
    recommit:false//防重复提交
  },
  reducers:{
/*    handleUsers (state , action) {
      return {
        ...state,
        users:action.payload.users
      }
    },*/
    handleBusinesses (state , action) {
      return {
        ...state,
        businesses:action.payload.businesses
      }
    },
    handleRecommit (state , action) {
      return {
        ...state,
        recommit:action.payload.recommit
      }
    },
  },
  effects:{
    *addApp({payload} , {call,put}){
      let res = yield call(addApp , payload)
      if(res.code === 0){
        yield put({type:'handleRecommit',payload:{recommit:false}})
        yield put(routerRedux.push({
          pathname: '/cmdb/app',
        }))
        message.success("应用新增成功")
      }else{
        yield put({type:'handleRecommit',payload:{recommit:false}})
        message.error(res.msg)
      }
    },

/*    *getUsers({payload} , {call,put}){
      let res = yield call(getUsers , payload)
      if(res.code === 0){
        yield put({
          type:"handleUsers",
          payload:{
            users:res.data
          }
        })
      }else{
        message.error(res.msg)
      }
    },*/
    *getBusinesses({payload} , {call,put}){
      let res = yield call(getBusinesses , payload)
      if(res.code === 0){
        yield put({
          type:"handleBusinesses",
          payload:{
            businesses:res.data
          }
        })
      }else{
        message.error(res.msg)
      }
    },
  },
  subscriptions:{
  }
}
