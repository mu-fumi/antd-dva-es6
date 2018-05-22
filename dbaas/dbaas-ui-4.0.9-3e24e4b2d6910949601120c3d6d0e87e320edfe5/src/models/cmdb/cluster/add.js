/**
 * Created by zhangmm on 2017/9/2.
 */
import { addCluster, getUsers, getApplications } from 'services/cmdb'
import { Link , browserHistory } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'addCluster',
  state:{
   /* users: [],*/
    apps:[],
  },
  reducers:{
/*    handleUsers:(state , action) => {
      return{
        ...state,
        users:action.payload.users
      }
    },*/
    handleApplications:(state , action) => {
      return{
        ...state,
        apps:action.payload.apps
      }
    }
  },
  effects:{
    *addCluster({payload} , {call}){
      let res = yield call(addCluster , payload)
      if(res.code === 0){
        browserHistory.push('cmdb/cluster')
      }else{
        message.error(res.msg)
      }
    },
/*    *getUsers({payload} , {call,put}){
      let res = yield call(getUsers , payload)
      if(res.code === 0){
        yield put({
          type:"handleUsers",
          payload:{
            users:res.data.data
          }
        })
      }else{
        message.error(res.msg)
      }
    },*/
    *getApplications({payload} , {call,put}){
      let res = yield call(getApplications , payload)
      if(res.code === 0){
        yield put({
          type:"handleApplications",
          payload:{
            apps:res.data.data
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
