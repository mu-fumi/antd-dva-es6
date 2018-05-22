/**
 * Created by wengyian on 2017/7/27.
 */

import { getSchedule, deleteSchedule, } from 'services/schedulers'
import pathToRegexp from 'path-to-regexp'
import { routerRedux } from 'dva/router'
import {message} from 'antd'

export default {
  namespace : 'work/schedulers/detail',
  state : {
    ID : '',
    scheduleInfo : {}
  },
  reducers : {
    setID(state, action){
      return {
        ...state,
        ID : action.payload
      }
    },

    setScheduleInfo(state, action){
      return {
        ...state,
        scheduleInfo : action.payload
      }
    }
  },
  effects : {
    *getSchedule({
      payload
    }, { put, call }){
      const res = yield call(getSchedule, payload)
      if(res.code === 0){
        yield put({
          type : 'setScheduleInfo',
          payload : res.data
        })
      }else{
        message.error(res.error || res.msg)
        yield put(routerRedux.push('./schedulers'))
      }
    },

    *deleteSchedule({
      payload
    }, { put, call }){
      const res = yield call(deleteSchedule, payload)
      if(res.code === 0){
        yield put(routerRedux.push('/schedulers'))
      }else{
        message.error(res.error || res.msg)
      }
    }
  },
  subscriptions : {
    setup({history, dispatch}){
      history.listen(({pathname}) => {
        const match = pathToRegexp('/schedulers/detail/:id').exec(pathname)
        if(match){
          dispatch({
            type : 'setID',
            payload : match[1]
          })

          // 请求接口, 获取基础信息
          dispatch({
            type : 'getSchedule',
            payload : match[1]
          })
        }

      })

    }
  }
}
