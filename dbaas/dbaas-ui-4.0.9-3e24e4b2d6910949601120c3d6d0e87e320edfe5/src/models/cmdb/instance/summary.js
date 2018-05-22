/**
 * Created by wengyian on 2017/11/29.
 */
/**
 * Created by wengyian on 2017/9/7.
 */

import { getInstance, getPwd, switchMaster } from 'services/cmdbMonitor'
import { updateStatus, } from 'services/cmdbCluster'
import { Link , routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'
import { constant } from 'utils'
const { RELATE_TYPE } = constant

export default {
  namespace : 'cmdb/instance/summary',
  state : {
    instance : {},
    reload : 0,
    instanceId : 0,
    delayTimer : '',
    updating : false,
    spinning : true,
    relateType : RELATE_TYPE.instance,
  },
  reducers : {
    setInstance(state, action){
      return {
        ...state,
        instance : action.payload
      }
    },

    setInstanceId(state, action){
      return {
        ...state,
        instanceId : action.payload,
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

    clearInstance(state, action){
      return {
        ...state,
        instance : {}
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
    *getInstance({
                  payload
                }, { put, call }){
      const res = yield call(getInstance, payload)
      if(res.code === 0){
        yield put({
          type : 'setInstance',
          payload : res.data
        })
        yield put({
          type : 'setSpinning',
          payload : false
        })
      }else{
        message.error(res.msg || res.error)
        yield put(routerRedux.push('/cmdb/instance'))
      }
    },

    *updateStatus({
                    payload
                  }, { put, call }){
      const ids = [].concat(payload)
      const params = {
        ids,
        summary : false,
        type : RELATE_TYPE.instance
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
      let instanceId = ''

      history.listen(({ pathname }) => {
        const match = pathToRegexp('/cmdb/instance/:id(\\d+)').exec(pathname)
        if(match){
          const paramsId = match[1]
          instanceId = paramsId
          dispatch({
            type : 'getInstance',
            payload : paramsId
          })
          dispatch({
            type : 'setInstanceId',
            payload : paramsId
          })
          // dispatch({
          //   type : 'setRelateType',
          //   payload : RELATE_TYPE.instance
          // })
          // 开始定时器
          const delayTimer = setInterval(() => {
            dispatch({
              type : 'getInstance',
              payload : instanceId
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
