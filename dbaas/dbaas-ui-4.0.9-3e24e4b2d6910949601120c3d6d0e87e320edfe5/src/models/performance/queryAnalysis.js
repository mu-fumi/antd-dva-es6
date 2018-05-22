
import { Menu, TimeFilter } from 'utils'
import { queryAnalysis } from 'services/performance'
const queryString = require('query-string')

export default {
  namespace: 'performance/queryAnalysis',
  state: {
    chartData: { type: 'line', option: {title: '查询分析图', values:[]} },
    queryTimeFilter:{
      radio: 'last_30_minutes',
      picker: []
    },
    digest: '',
    sqlID: '',
    queryAnalysisSorter: ['avg_latency', 'descend'],
  },
  reducers: {
    handleLoad (state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    handleTimeFilter(state, action){
      return {
        ...state,
        queryTimeFilter: {
          ...state.queryTimeFilter,
          ...TimeFilter.parse(action.payload)
        }
      }
    },
    handleDigest(state, action){
      return {
        ...state,
        ...action.payload
      }
    },
    handleSqlID(state, action){
      return {
        ...state,
        ...action.payload
      }
    },
    showModal (state) {
      return {
        ...state,
        visible: true
      }
    },
    hideModal (state) {
      return {
        ...state,
        visible: false,
      }
    },
    handleTableSorter (state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
  },
  effects: {
    *getLoadLine ({ payload = {} }, { put, call, select}) {
      const { currentNode } = yield select((state) => { return state['performance']})
      const { digest } = yield select((state) => { return state['performance/queryAnalysis']})
      const { time = 'last_30_minutes' } = payload

      yield put({type: 'handleTimeFilter', payload: time})

      if(!currentNode){
        return false
      }

      const res = yield call(queryAnalysis, {hostname: currentNode, time, digest })

      if (res.code === 0) {
        yield put({
          type: 'handleLoad',
          payload: {
            chartData: { type: 'line', option: res.data }
          }
        })
      }
    },
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen(location => {
        if (/query-analyzer/.test(location.pathname)) {
          const query = queryString.parse(location.search)
          dispatch({
            type: 'handleDigest',
            payload: {
              digest: query.digest
            }
          })
          dispatch({
            type: 'getLoadLine',
            payload: {
              time: query.time
            }
          })
        }
      })
    }
  }
}
