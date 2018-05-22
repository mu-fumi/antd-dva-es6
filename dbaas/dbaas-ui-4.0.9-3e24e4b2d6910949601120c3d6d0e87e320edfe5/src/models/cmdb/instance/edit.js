/**
 * Created by zhangmm on 2017/9/28.
 */
import { editInstance, getInstance } from 'services/cmdb'
import { Link , browserHistory } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'editInstance',
  state:{
    name: '',
    desc: '',
    stack_id:'',
  },
  reducers:{
    handleInstance (state , action) {
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
        stack_id:'',
      }
    },
  },
  effects:{
    *editInstance({payload , id} , {call}){
      let res = yield call(editInstance , payload , id)
      if(res.code === 0){
        browserHistory.push('cmdb/instance')
      }else{
        message.error(res.msg)
      }
    },
    *getInstance({payload} , {call , put}){
      let res = yield call(getInstance , payload )
      if(res.code === 0){
        yield put({
          type:'handleInstance',
          payload:{
            name:res.data.name,
            desc:res.data.desc,
            stack_id:res.data.stack_id,
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
        if (/cmdb(\/)instance(\/)edit(\/)(\d+)$/.test(pathname)) {
          const path = pathToRegexp('cmdb/instance/edit/:id(\\d+)').exec(pathname)
          const id = path[1]
          dispatch({
            type : `getInstance`,
            payload : {id: id}
          })
        }})
    }
  }
}
