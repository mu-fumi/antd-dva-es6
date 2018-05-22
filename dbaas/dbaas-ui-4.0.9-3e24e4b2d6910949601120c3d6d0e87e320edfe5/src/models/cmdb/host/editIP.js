/**
 * Created by zhangmm on 2017/8/22.
 */
import { getHostIP, editHostIP } from 'services/cmdb'
import { Link , browserHistory } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'editHostIP',
  state:{
    paramIP:{
      admin_ip1:"",
      admin_ip2:"",
      admin_vip1:"",
      admin_vip2:"",
      business_ip1:"",
      business_ip2:"",
      business_vip1:"",
      business_vip2:"",
      connect_ip:"",
      created_at:"",
      host_name:"",
      master_host:"",
      repl_ip1:"",
      repl_ip2:"",
      repl_vip1:"",
      repl_vip2:"",
      type:"",
      updated_at:"",
      user_id:""
    }
  },
  reducers:{
    handleHostIP (state , action) {
      return {
        ...state,
        paramIP:action.payload
      }
    },
    handleHostParam (state , action) {
      return {
        ...state,
        paramIP:{
          ...state.paramIP,
          ...action.payload
        }
      }
    },
    handleReset (state) {
      return {
        ...state,
        paramIP:{
          admin_ip1:"",
          admin_ip2:"",
          admin_vip1:"",
          admin_vip2:"",
          business_ip1:"",
          business_ip2:"",
          business_vip1:"",
          business_vip2:"",
          connect_ip:"",
          created_at:"",
          host_name:"",
          master_host:"",
          repl_ip1:"",
          repl_ip2:"",
          repl_vip1:"",
          repl_vip2:"",
          type:"",
          updated_at:"",
          user_id:""
        }
      }
    },
  },
  effects:{
    *editHostIP({payload , name} , {call}){
      let res = yield call(editHostIP , payload , name)
      if(res.code === 0){
        browserHistory.push('cmdb/host')
      }else{
        message.error(res.msg)
      }
    },
    *getHostIP({payload} , {call , put}){
      let res = yield call(getHostIP , payload)
      if(res.code === 0){
        yield put({
          type:'handleHostIP',
          payload:res.data
        })
      }else{
        message.error(res.msg)
      }
    },
  },
  subscriptions:{
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/host(\/)([\u4e00-\u9fa5\-\.\w\d]+)(\/)editIP$/.test(pathname)) {
          const path = pathToRegexp('host/:name([\u4e00-\u9fa5\-\.\\w\\d]+)/editIP').exec(pathname)
          const name = path[1]
          dispatch({
            type : `getHostIP`,
            payload : {name: name}
          })
        }})
    }
  }
}
