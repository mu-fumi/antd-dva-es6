/**
 * Created by zhangmm on 2017/9/1.
 */
import { editApp, getApp, getUsers, getBusinesses } from 'services/cmdb'
//import { Link , browserHistory } from 'dva/router'
import { routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'editApp',
  state:{
    name: '',
    desc: '',
 /*   user_id:'',
    users:[],*/
    business_id:'',
    businesses:[],
    recommit:false//防重复提交
  },
  reducers:{
    handleApp (state , action) {
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
/*        user_id:'',
        users:[],*/
        business_id:'',
        businesses:[],
        recommit:false//防重复提交
      }
    },
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
    *editApp({payload , id} , {call,put}){
      let res = yield call(editApp , payload , id)
      if(res.code === 0){
        yield put({type:'handleRecommit',payload:{recommit:false}})
        yield put(routerRedux.push({
          pathname: '/cmdb/app',
        }))
        message.success("应用修改成功")
      }else{
        yield put({type:'handleRecommit',payload:{recommit:false}})
        message.error(res.msg)
      }
    },
    *getApp({payload} , {call , put}){
      let res = yield call(getApp , payload )
      if(res.code === 0){
        yield put({
          type:'handleApp',
          payload:{
            name:res.data.name,
            desc:res.data.desc,
            /*user_id:res.data.user_id,*/
            business_id:res.data.business_id,
          }
        })
      }else{
        yield put(routerRedux.push('/cmdb/app'))
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
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/cmdb(\/)app(\/)(\d+)(\/)edit$/.test(pathname)) {
          const path = pathToRegexp('/cmdb/app/:id(\\d+)/edit').exec(pathname)
          const id = path[1]
          dispatch({
            type : `getApp`,
            payload : {id: id}
          })
/*          dispatch({
            type : `getUsers`
          })*/
          dispatch({
            type : `getBusinesses`,
            payload:{
              type:0,
              paging:0
            }
          })
        }})
    }
  }
}
