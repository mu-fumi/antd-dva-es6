/**
 * Created by wengyian on 2017/11/20.
 */

import { getServiceInfo } from 'services/stack'
import { Modal, message } from 'antd'
import pathToRegexp from 'path-to-regexp'
import { routerRedux } from 'dva/router'

export default {
  namespace : 'stack/serviceDetail',
  state : {
    info : {}
  },
  reducers : {
    setInfo(state, action){
      return {
        ...state,
        info : action.payload
      }
    }
  },
  effects : {
    *getInfo({
      payload
    }, { call, put }){
      const res = yield call(getServiceInfo, payload)
      if(res.code === 0 ){
        yield put({
          type : 'setInfo',
          payload : res.data
        })
      }else{
        message.error(res.msg || res.err)
        yield put(routerRedux.push('/cmdb/component/service-view'))
      }
    }
  },
  subscriptions : {
    setup({dispatch, history}){
      history.listen(({ pathname }) => {
        const match = pathToRegexp('/cmdb/component/service-view/:id(\\d+)').exec(pathname)
        if(match){
          const serviceId = match[1]
          dispatch({
            type : 'getInfo',
            payload : serviceId
          })
        }
      })
    }
  }
}
