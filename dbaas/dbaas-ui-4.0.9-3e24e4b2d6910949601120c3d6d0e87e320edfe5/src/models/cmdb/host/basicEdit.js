/**
 * Created by zhangmm on 2017/8/23.
 */
import { getHost, editHost, getCity, getIdc } from 'services/cmdb'
import { Link , browserHistory } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'basicEditHost',
  state:{
    params:{
      city:"",
      connect_port:"",
      connect_type:"",
      created_at:"",
      db_count:"",
      db_memory:"",
      db_ports:"",
      eth_interface:"",
      executed_jobs:"",
      id:"",
      idc:"",
      machine_ip:"",
      machine_memory:"",
      machine_name:"",
      max_db_count:"",
      priority:"",
      progress:"",
      root_name:"",
      state:"",
      tag:"",
      type:"",
      updated_at:"",
      user_id:"",
      user_name:"",
      user_password:"",
      weight:"",
    },
    city:"",
    idc:""
  },
  reducers:{
    handleHost (state , action) {
      return {
        ...state,
        params:action.payload
      }
    },
    handleCity (state , action) {
      return {
        ...state,
        city:action.payload
      }
    },
    handleIdc (state , action) {
      return {
        ...state,
        idc:action.payload
      }
    },
    handleHostParams (state , action) {
      return {
        ...state,
        params:{
          ...state.params,
          ...action.payload
        }
      }
    },
    handleReset (state) {
      return {
        ...state,
        params:{
          city:"",
          connect_port:"",
          connect_type:"",
          created_at:"",
          db_count:"",
          db_memory:"",
          db_ports:"",
          eth_interface:"",
          executed_jobs:"",
          id:"",
          idc:"",
          machine_ip:"",
          machine_memory:"",
          machine_name:"",
          max_db_count:"",
          priority:"",
          progress:"",
          root_name:"",
          state:"",
          tag:"",
          type:"",
          updated_at:"",
          user_id:"",
          user_name:"",
          user_password:"",
          weight:"",
        },
        city:"",
        idc:""
      }
    },
  },
  effects:{
    *editHost({payload , id} , {call}){
      let res = yield call(editHost , payload , id)
      if(res.code === 0){
        browserHistory.push('cmdb/host')
        message.success('修改成功')
      }else{
        message.error(res.msg)
      }
    },
    *getHost({payload} , {call , put}){
      let res = yield call(getHost , payload)
      if(res.code === 0){
        yield put({
          type:'handleHost',
          payload:res.data
        })
      }else{
        message.error(res.msg)
      }
    },
    *getCity({payload} , {call , put}){
      let res = yield call(getCity , payload)
      if(res.code === 0){
        yield put({
          type:'handleCity',
          payload:res.data.value
        })
      }else{
        message.error(res.msg)
      }
    },
    *getIdc({payload} , {call , put}){
      let res = yield call(getIdc , payload)
      if(res.code === 0){
        yield put({
          type:'handleIdc',
          payload:res.data.value
        })
      }else{
        message.error(res.msg)
      }
    }
  },
  subscriptions:{
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/cmdb(\/)host(\/)edit(\/)(\d+)$/.test(pathname)) {
          const path = pathToRegexp('cmdb/host/edit/:id(\\d+)').exec(pathname)
          const id = path[1]
          dispatch({
            type : `getHost`,
            payload : {id: id}
          })
          dispatch({
            type : `getCity`
          })
          dispatch({
            type : `getIdc`
          })
        }})
    }
  }
}
