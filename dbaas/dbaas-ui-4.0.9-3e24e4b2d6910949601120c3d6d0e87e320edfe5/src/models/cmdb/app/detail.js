/**
 * Created by zhangmm on 2017/11/01.
 */
import { getApp, deleteApp } from 'services/cmdb'
//import { Link , browserHistory } from 'dva/router'
import { routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'
import { Cache } from 'utils'
const cookie = new Cache('cookie')

export default {
  namespace:'appDetail',
  state:{
    app:{}
  },
  reducers:{
    handleReset (state , action) {
      return {
        ...state,
        app:{}
      }
    },
    handleApp (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
  },
  effects:{
    *getApp({payload} , {call , put}){
      let res = yield call(getApp , payload )
      if(res.code === 0){
        yield put({
          type:'handleApp',
          payload:{
            app:res.data
          }
        })
        yield put({
          type : 'app/handlePageBtns',
          payload : {props: {id:payload.id,disabled:res.data.level === 1 ? false :
            (cookie.get('uid') === res.data.user_id ? false : true)}}
        })
      }else{
        yield put(routerRedux.push('/cmdb/app'))
        message.error(res.msg)
      }
    },
    *deleteApp({payload} , {call , put}){
      let res = yield call(deleteApp , payload)
      if(res.code === 0){
        yield put(routerRedux.push({
          pathname: '/cmdb/app',
        }))
        message.success("应用删除成功")
      }else{
        message.error(res.msg)
      }
    },
  },
  subscriptions:{
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/cmdb(\/)app(\/)(\d+)(\/)detail/.test(pathname)) {
          const path = pathToRegexp('/cmdb/app/:id(\\d+)/detail').exec(pathname)
          const id = path[1]
          dispatch({
            type : `getApp`,
            payload : {id: id}
          })
        }})
    }
  }
}
