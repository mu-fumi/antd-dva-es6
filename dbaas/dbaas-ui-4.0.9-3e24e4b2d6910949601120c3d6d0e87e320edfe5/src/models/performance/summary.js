/**
 * Created by wengyian on 2017/6/12.
 */

import { Menu, TimeFilter } from 'utils'
import { getDigest, getSummary } from 'services/performance'
import { Modal, Message } from 'antd'
import * as moment from 'moment'
import { SUMMARY_HOVER, SUMMARY_HOVER_LINK } from 'utils/constant'

export default {
  namespace : 'performance/summary',
  state : {
    summaryLine : [{
      type : 'summary_line',
      option : {
        title : '平均响应时间',
        values : []
      }
    }],
    summaryFilter : {
      radio : 'last_30_minutes',
      picker : []
    },
    sqlDigest : [],
    selectedTime : 'last_30_minutes',
    selectReRender : new Date().getTime(),
    averageTime : (new Date())/1000 -60,
    tableData : {}
  },
  reducers : {
    handleSummaryLine(state, action){
      return {
        ...state,
        summaryLine : action.payload
      }
    },
    handleSummaryFilter(state, action){
      return {
        ...state,
        summaryFilter : action.payload
      }
    },
    setDigest(state, action){
      return {
        ...state,
        sqlDigest : action.payload
      }
    },
    handleSelectedTime(state, action){
      return {
        ...state,
        selectedTime : action.payload
      }
    },
    handleSelectReRender(state, action){
      return {
        ...state,
        selectReRender: action.payload
      }
    },
    setTableData(state, action){
      // 获取图表的数据
      let source = state.summaryLine[0].option.values["平均响应时间"][action.payload]
      let tableData = {
        point :  parseInt(
          new Date(state.summaryLine[0].option.end_time).getTime()
          - new Date(state.summaryLine[0].option.start_time).getTime())
      }
      if( source && source[2]){
        tableData =  { ...source[2], ...tableData}
      }
      // console.log('tableData===>', tableData)
      return {
        ...state,
        tableData : tableData
      }
    },
    setAverageTime(state, action){
      return {
        ...state,
        averageTime: (new Date(action.payload)/1000 -60 )
      }
    }
  },
  effects : {
    *getSummaryLine({
                      payload = {}
                    }, { put, call, select }){
      const { currentNode, selectedTime } = yield select(
        (state) => ({...state['performance'], ...state['performance/summary'] })
      )
      const { time = selectedTime } = payload

      if(!currentNode){
        return false
      }

      let res = yield call(getSummary , { time, 'hostname' : currentNode, ...payload})

      if(res.code === 0){
        yield put({
          type : 'handleSummaryLine',
          payload : [{
            type : 'summary_line',
            option : res.data
          }]
        })
        // 获取最后一个数据
        if(res.data && res.data.values['平均响应时间']){
          yield put({
            type : 'setTableData',
            payload : res.data.values['平均响应时间'].length - 1
          })
          yield put({
            type : 'setAverageTime',
            payload : res.data.end_time
          })
        }
      }else {
        Message.error(res.error || res.msg )
      }
    },

    *getTimeFilter({
                     payload = {}
                   }, { put, call, select }){

      const { selectedSQL, selectedTime } = yield select((state) => {
        return state['performance/summary']
      })

      const { time = selectedTime } = payload
      yield put({
        type : 'handleSummaryFilter',
        payload : TimeFilter.parse(time)
      })

      yield put({
        type : 'handleSelectedTime',
        payload : time
      })

      yield put({
        type : 'getSummaryLine',
        payload : {
          time : time
        }
      })

      yield put({
        type : 'getDigest',
        payload : {
          time
        }
      })


    },


    *getDigest({
                 payload = {}
               }, { put, call, select }){

      const { currentNode, selectedTime } = yield select(
        (state) => ({...state['performance'], ...state['performance/summary'] })
      )

      const { time = 'selectedTime', hostname = currentNode } = payload

      if(!currentNode){
        return false
      }

      let res = yield call(getDigest, {'hostname' : hostname, 'time' : time})
      if(res.code === 0){
        yield put({
          type : 'handleSelectReRender',
          payload : new Date().getTime()
        })
        yield put({
          type : 'setDigest',
          payload : res.data
        })
      }else{
        Message.error(res.error || res.msg)
      }
    },

    *getSqlLine({
                  payload
                }, { put, call, select }){
      const { currentNode, selectedTime } = yield select(
        (state) => ({...state['performance'], ...state['performance/summary'] })
      )
      const time = selectedTime

      // 发请求给后台获取表格数据 将时间，节点和 已选 id 传过去
      yield put({
        type : 'getSummaryLine',
        payload : {
          'sql' : payload,
          'time' : time,
          'hostname' : currentNode
        }
      })

    }
  },
  subscriptions : {
    setup({ dispatch, history }){
      dispatch({
        type : 'getTimeFilter'
      })
    }
  }
}
