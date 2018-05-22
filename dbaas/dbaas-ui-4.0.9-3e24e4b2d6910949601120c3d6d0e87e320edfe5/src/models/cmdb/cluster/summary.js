/**
 * Created by wengyian on 2017/9/7.
 */

import { getCluster, getPwd, switchMaster } from 'services/cmdbMonitor'
import { updateStatus, } from 'services/cmdbCluster'
import { Link , routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'
import { constant } from 'utils'
const { RELATE_TYPE } = constant

export default {
  namespace : 'cmdb/cluster/summary',
  state : {
    cluster : {},
    reload : 0,
    clusterId : 0,
    delayTimer : '',
    updating : false,
    spinning : true,
    relateType : RELATE_TYPE.cluster,
  },
  reducers : {
    setCluster(state, action){
      return {
        ...state,
        cluster : action.payload
      }
    },

    setClusterId(state, action){
      return {
        ...state,
        clusterId : action.payload,
      }
    },

    setTimer(state, action){
      return {
        ...state,
        delayTimer : action.payload
      }
    },

    clearTimer(state, action){
      clearInterval(state.delayTimer)
      return {
        ...state,
        delayTimer : ''
      }
    },

    clearCluster(state, action){
      return {
        ...state,
        cluster : {}
      }
    },

    setUpdating(state, action){
      return {
        ...state,
        updating : action.payload
      }
    },

    setSpinning(state, action){
      return {
        ...state,
        spinning : action.payload
      }
    },

    // setRelateType(state, action){
    //   return {
    //     ...state,
    //     relateType : action.payload
    //   }
    // }
  },

  effects : {
    *getCluster({
      payload
    }, { put, call }){
      const res = yield call(getCluster, payload)
      if(res.code === 0){
        yield put({
          type : 'setCluster',
          payload : res.data
        })
        yield put({
          type : 'setSpinning',
          payload : false
        })
      }else{
        message.error(res.msg || res.error)
        yield put(routerRedux.push('/cmdb/cluster'))
      }
    },

    *updateStatus({
      payload
    }, { put, call }){
      const ids = [].concat(payload)
      const params = {
        ids,
        summary : false,
        type : RELATE_TYPE.cluster
      }
      const res = yield call(updateStatus, params)
      yield put({
        type : 'setUpdating',
        payload : false
      })
      if(res.code === 0){
        message.success('更新任务已提交后台处理，稍后刷新查看')
      }else{
        message.error(res.msg || res.error)
      }
    },
  },

  subscriptions : {
    setup({ dispatch, history}){
      // 获取页面参数
      let clusterId = ''

      history.listen(({ pathname }) => {
        const match = pathToRegexp('/cmdb/cluster/:id(\\d+)').exec(pathname)
        if(match){
          const paramsId = match[1]
          clusterId = paramsId
          dispatch({
            type : 'getCluster',
            payload : paramsId
          })
          dispatch({
            type : 'setClusterId',
            payload : paramsId
          })
          // dispatch({
          //   type : 'setRelateType',
          //   payload : RELATE_TYPE.cluster
          // })
          // 开始定时器
          const delayTimer = setInterval(() => {
            dispatch({
              type : 'getCluster',
              payload : clusterId
            })
          }, 5000)

          dispatch({
            type : 'setTimer',
            payload : delayTimer
          })
        }
      })
    }
  }
}
