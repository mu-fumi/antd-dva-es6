/**
 * Created by wengyian on 2017/9/7.
 */

import { getSet, getPwd, switchMaster } from 'services/cmdbMonitor'
import { updateStatus, } from 'services/cmdbCluster'
import { Link , routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'
import { constant } from 'utils'
const { RELATE_TYPE } = constant

export default {
  namespace : 'cmdb/set/summary',
  state : {
    set : {},
    reload : 0,
    setId : 0,
    delayTimer : '',
    updating : false,
    spinning : true,
    relateType : RELATE_TYPE.set,
  },
  reducers : {
    setSet(state, action){
      return {
        ...state,
        set : action.payload
      }
    },

    setSetId(state, action){
      return {
        ...state,
        setId : action.payload,
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

    clearSet(state, action){
      return {
        ...state,
        set : {}
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
    *getSet({
                   payload
                 }, { put, call }){
      const res = yield call(getSet, payload)
      if(res.code === 0){
        yield put({
          type : 'setSet',
          payload : res.data
        })
        yield put({
          type : 'setSpinning',
          payload : false
        })
      }else{
        message.error(res.msg || res.error)
        yield put(routerRedux.push('/cmdb/instance-group'))
      }
    },

    *updateStatus({
                    payload
                  }, { put, call }){
      const ids = [].concat(payload)
      const params = {
        ids,
        summary : false,
        type : RELATE_TYPE.set
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
      let setId = ''

      history.listen(({ pathname }) => {
        const match = pathToRegexp('/cmdb/instance-group/:id(\\d+)').exec(pathname)
        if(match){
          const paramsId = match[1]
          setId = paramsId
          dispatch({
            type : 'getSet',
            payload : paramsId
          })
          dispatch({
            type : 'setSetId',
            payload : paramsId
          })
          // dispatch({
          //   type : 'setRelateType',
          //   payload : RELATE_TYPE.set
          // })
          // 开始定时器
          const delayTimer = setInterval(() => {
            dispatch({
              type : 'getSet',
              payload : setId
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
