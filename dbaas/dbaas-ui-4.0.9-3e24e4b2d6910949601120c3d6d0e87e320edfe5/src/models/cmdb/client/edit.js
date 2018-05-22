/**
 * Created by zhangmm on 2017/8/18.
 */
import { editClient, getClient } from 'services/cmdb'
import { Link , browserHistory } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'editClient',
  state:{
    name: '',
    desc: ''
  },
  reducers:{
    handleClient (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleReset (state) {
      return {
        ...state,
        name: '',
        desc: ''
      }
    },
  },
  effects:{
    *editClient({payload , id} , {call}){
      let res = yield call(editClient , payload , id)
      if(res.code === 0){
        browserHistory.push('cmdb/client')
      }else{
        message.error(res.msg)
      }
    },
    *getClient({payload} , {call , put}){
      let res = yield call(getClient , payload)
      if(res.code === 0){
        yield put({
          type:'handleClient',
          payload:{
            name:res.data.name,
            desc:res.data.desc
          }
        })
      }else{
        message.error(res.msg)
      }
    }
  },
  subscriptions:{
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/cmdb(\/)client(\/)edit(\/)(\d+)$/.test(pathname)) {
          const path = pathToRegexp('cmdb/client/edit/:id(\\d+)').exec(pathname)
          const id = path[1]
          dispatch({
            type : `getClient`,
            payload : {id: id}
          })
        }})
    }
  }
}
