/**
 * Created by wengyian on 2017/8/2.
 */

import { getServiceInfo, getVersionList, updateService } from 'services/stack'
import { message } from 'antd'
import { routerRedux } from 'dva/router'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace : 'stack/editService',
  state : {
    serviceInfo : {},
    versionList : {},
    serviceId : -1,
  },
  reducers : {
    saveServiceInfo(state, action){
      return {
        ...state,
        serviceInfo : action.payload
      }
    },

    setVersionList(state, action){
      return {
        ...state,
        versionList : action.payload
      }
    },

    setServiceId(state, action){
      return {
        ...state,
        serviceId : action.payload
      }
    },

  },
  effects : {
    *getServiceInfo({
      payload
    },{ put, call }){
      let res = yield call(getServiceInfo, payload)
      if(res.code === 0){
        yield put({
          type : 'saveServiceInfo',
          payload : res.data
        })
      }else{
        message.error( res.error || res.msg )
        yield put(routerRedux.push('/cmdb/component/service-view'))
      }
    },

    *getVersionList({
      payload
    }, { put, call }){
      const res = yield call(getVersionList)
      if(res.code === 0){
        yield put({
          type : 'setVersionList',
          payload : res.data
        })
      }else{
        message.error( res.error || res.msg )
      }
    },

    *updateService({
      payload
    }, { put, call }){
      const res = yield call(updateService, payload)
      if(res.code === 0){
        message.success('保存成功')
        yield put(routerRedux.push('/cmdb/component/service-view'))
      }else{
        message.error( res.error || res.msg )
      }
    }
  },
  subscriptions : {
    setup({ dispatch, history }){
      history.listen(({pathname}) => {
        let match = pathToRegexp('/cmdb/component/editService/:id(\\d+)').exec(pathname)
        if(match){
          dispatch({
            type : 'getServiceInfo',
            payload : match[1]
          })
          dispatch({
            type : 'setServiceId',
            payload : match[1]
          })
          dispatch({
            type : 'getVersionList'
          })
        }
      })
    }
  }
}
