/**
 * Created by zhangmm on 2017/9/2.
 */
import { editCluster, getCluster, getUsers, getApplications } from 'services/cmdb'
import { Link , browserHistory } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'editCluster',
  state:{
    name: '',
    desc: '',
    user_id:'',
    users:[],
    app_id:'',
    apps:[],
  },
  reducers:{
    handleCluster (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleReset (state) {
      return {
        ...state,
        name: '',
        desc: '',
        user_id:'',
        users:[],
        app_id:'',
        apps:[],
      }
    },
    handleUsers (state , action) {
      return {
        ...state,
        users:action.payload.users
      }
    },
    handleApplications:(state , action) => {
      return{
        ...state,
        apps:action.payload.apps
      }
    }
  },
  effects:{
    *editCluster({payload , id} , {call}){
      let res = yield call(editCluster , payload , id)
      if(res.code === 0){
        browserHistory.push('cmdb/cluster')
      }else{
        message.error(res.msg)
      }
    },
    *getCluster({payload} , {call , put}){
      let res = yield call(getCluster , payload )
      debugger
      if(res.code === 0){
        yield put({
          type:'handleCluster',
          payload:{
            name:res.data.name,
            desc:res.data.desc,
            user_id:res.data.user_id,
            app_id:res.data.app_id,
          }
        })
      }else{
        message.error(res.msg)
      }
    },
    *getUsers({payload} , {call,put}){
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
    },
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
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/cmdb(\/)cluster(\/)edit(\/)(\d+)$/.test(pathname)) {
          const path = pathToRegexp('cmdb/cluster/edit/:id(\\d+)').exec(pathname)
          const id = path[1]
          dispatch({
            type : `getCluster`,
            payload : {id: id}
          })
          dispatch({
            type : `getUsers`
          })
          dispatch({
            type : `getApplications`
          })
        }})
    }
  }
}
