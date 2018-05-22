import { Menu, TimeFilter } from 'utils'
import { graph, session, processlist } from 'services/performance'
import { Modal, message } from 'antd'
import * as moment from 'moment'

export default {
  namespace: 'performance/session',
  state: {
    currentLoad: [],
    sessionLine: [{ type: 'line', option: {title: '会话曲线图', values:[]} }],
    waitLine: [{ type: 'line', option: {title: '等待曲线图', values:[]} }],
    sessionFilter:{
      radio: 'last_30_minutes',
      picker: []
    },
    waitFilter:{
      radio: 'last_30_minutes',
      picker: [],
    },
    waitTableTime: (+ new Date())/1000 - 60,
    processList: {},
    processListVisible: false
  },
  reducers: {
    handleSessionLine (state, action) {
      return {
        ...state,
        sessionLine: action.payload,
      }
    },
    handleWaitLine (state, action) {
      return {
        ...state,
        waitLine: action.payload,
      }
    },
    handleSessionFilter(state, action){
      return {
        ...state,
        sessionFilter: {
          ...action.payload
        }
      }
    },
    handleWaitFilter(state, action){
      return {
        ...state,
        waitFilter: {
          ...action.payload
        }
      }
    },
    handleWaitTableTime(state, action){
      return {
        ...state,
        waitTableTime: action.payload
      }
    },
    handleProcesslist(state, action){
      return {
        ...state,
        processList: {
          ...action.payload
        }
      }
    },
    showProcesslistModal(state){
      return {
        ...state,
        processListVisible: true
      }
    },
    hideProcesslistModal(state){
      return {
        ...state,
        processListVisible: false
      }
    },
  },
  effects: {
    *getSessionLine ({ payload = {} }, { put, call, select}) {
      const { currentNode } = yield select((state) => { return state['performance']})
      const { time = 'last_30_minutes' } = payload

      yield put({type: 'handleSessionFilter', payload: TimeFilter.parse(time)})

      if(!currentNode){
        return false
      }

      const res = yield call(graph, { key: 'session',  hostname: currentNode, time })

      if (res.code === 0) {
        yield put({
          type: 'handleSessionLine',
          payload: [{ type: 'line', option: res.data }]
        })

      }
    },
    *getWaitLine ({ payload = {} }, { put, call, select}) {
      const { currentNode } = yield select((state) => { return state['performance']})
      const { time = 'last_30_minutes' } = payload

      yield put({type: 'handleWaitFilter', payload: TimeFilter.parse(time)})

      if(!currentNode){
        return false
      }

      const res = yield call(session, { key: '',  hostname: currentNode, time })

      if (res.code === 0) {
        yield put({
          type: 'handleWaitLine',
          payload: [{ type: 'line', option: res.data }]
        })
      }
    },
    *getWaitTable ({ payload = {} }, { put, call, select}){
      const { currentNode } = yield select((state) => { return state['performance']})
      //具体某个时间点,如果没有则当前时间的前一分钟
      const { time = (+ new Date())/1000 - 60 } = payload

      yield put({
        type: 'handleWaitTableTime',
        payload: time
      })

      if(!currentNode){
        return false
      }

      const res = yield call(processlist, { hostname: currentNode, time })
      if (res.code === 0) {
        yield put({
          type: 'handleProcesslist',
          payload: res.data
        })
      }
    },
    *processModal () {

    }
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      dispatch({ type: 'getSessionLine' })
      dispatch({ type: 'getWaitLine' })
      //dispatch({ type: 'getWaitTable' })
    }
  }
}
