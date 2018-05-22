/**
 * Created by zhangmm on 2017/9/1.
 */
import { addBusiness, getUsers } from 'services/cmdb'
import { Link , routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'addBusiness',
  state:{
    users:[],
    recommit:false//防重复提交
  },
  reducers:{
    handleUsers (state , action) {
      return {
        ...state,
        users:action.payload.users
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
    *addBusiness({payload} , {call,put}){
      let res = yield call(addBusiness , payload)
      if(res.code === 0){
        yield put({type:'handleRecommit',payload:{recommit:false}})
        yield put(routerRedux.push({
          pathname: '/cmdb/business',
        }))
        message.success("业务新增成功")
      }else{
        yield put({type:'handleRecommit',payload:{recommit:false}})
        message.error(res.msg)
      }
    },
    *getUsers({payload} , {call,put}){
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
    },
  },
  subscriptions:{
  }
}
