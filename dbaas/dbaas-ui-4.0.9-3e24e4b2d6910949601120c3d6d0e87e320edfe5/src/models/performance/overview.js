import { Menu, TimeFilter } from 'utils'
import { graph } from 'services/performance'
import { Modal, message } from 'antd'

export default {
  namespace: 'performance/overview',
  state: {
    currentLoad: [],
    loadLine: [{ type: 'line', option: {title: '负载曲线图', values:[]} }],
    timeCostLine: [{ type: 'line', option: {title: '平均时耗曲线图', values:[]} }],
    loadFilter:{
      radio: 'last_30_minutes',
      picker: []
    },
    topFilter:{
      radio: 'last_30_minutes',
      picker: [],
      reload: (+ new Date())
    },
    timeCostFilter:{
      radio: 'last_30_minutes',
      picker: []
    },
    nic: '',
    bandwidth: ''
  },
  reducers: {
    handleCurrentLoad (state, action) {
      return {
        ...state,
        currentLoad : action.payload,
      }
    },
    handleLoadLine (state, action) {
      return {
        ...state,
        loadLine : action.payload,
      }
    },
    handleTimeCostLine (state, action) {
      return {
        ...state,
        timeCostLine : action.payload,
      }
    },
    handleLoadFilter(state, action){
      return {
        ...state,
        loadFilter: {
          ...action.payload
        }
      }
    },
    handleTimeCostFilter(state, action){
      return {
        ...state,
        timeCostFilter: {
          ...action.payload
        }
      }
    },
    handleTopFilter(state, action){
      const { time = 'last_30_minutes' } = action.payload

      return {
        ...state,
        topFilter: {
          reload: (+ new Date()),
          ...TimeFilter.parse(time)
        }
      }
    },
    handleCurrentNic (state, action) {
      return {
        ...state,
        nic : action.payload,
      }
    },
    handleCurrentBandwidth (state, action) {
      return {
        ...state,
        bandwidth : action.payload,
      }
    },
  },
  effects: {
    *getCurrentLoad ({ payload = {} }, { put, call, select }) {  // 当前负载
      const { currentNode } = yield select((state) => { return state['performance']})
      const { time = 'now' } = payload

      if(!currentNode){
        return false
      }
      const res = yield call(graph, { key: 'current_load', hostname: currentNode, time })
      if (res.code === 0) {
        yield put({
          type: 'handleCurrentLoad',
          payload: res.data.data.map((v)=>{
            if(v.key === 'cpu_use_rate'){
              return({ span: 4, type: 'gauge', option: v , miniType:'sector'})
            }else{
              return({ span: 4, type: 'gauge', option: v , miniType:'circle'})
            }
          })
        })
        yield put({   // 当前负载标题
          type: 'handleCurrentNic',
          payload: res.data.nic
        })
        yield put({
          type: 'handleCurrentBandwidth',
          payload: res.data.bandwidth
        })
      }
    },
    *getLoadLine ({ payload = {} }, { put, call, select }) {
      const { currentNode } = yield select((state) => { return state['performance']})
      const { time = 'last_30_minutes' } = payload

      if(!currentNode){
        return false
      }

      yield put({type: 'handleLoadFilter', payload: TimeFilter.parse(time)})

      const res = yield call(graph, { key: 'current_load_line',  hostname: currentNode, time })

      if (res.code === 0) {
        yield put({
          type: 'handleLoadLine',
          payload: [{ type: 'line', option: res.data }]
        })
      }

    },
    *getTimeCostLine ({ payload = {} }, { put, call, select }) {
      const { currentNode } = yield select((state) => { return state['performance']})
      const { time = 'last_30_minutes' } = payload

      if(!currentNode){
        return false
      }

      yield put({type: 'handleTimeCostFilter', payload: TimeFilter.parse(time)})

      const res = yield call(graph, { key: 'avg_time_cost',  hostname: currentNode, time })

      if (res.code === 0) {
        yield put({
          type: 'handleTimeCostLine',
          payload: [{ type: 'line', option: res.data }]
        })
      }
    },
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      dispatch({ type: 'getCurrentLoad' })
      dispatch({ type: 'getLoadLine' })
      dispatch({ type: 'getTimeCostLine' })
      dispatch({ type: 'handleTopFilter', payload: {}})
    }
  }
}
