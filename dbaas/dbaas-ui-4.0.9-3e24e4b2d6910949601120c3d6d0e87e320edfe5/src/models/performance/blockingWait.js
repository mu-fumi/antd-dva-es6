
import { Menu, TimeFilter } from 'utils'
import { blockingWait } from 'services/performance'
import { Modal, message } from 'antd'
import * as moment from 'moment'
import _ from 'lodash'
const queryString = require('query-string')

const timeRange = {
  '30分钟': 'last_30_minutes',
  '3小时': 'last_3_hours',
  '12小时': 'last_12_hours',
  '24小时': 'last_24_hours',
  '七天': 'last_7_days'
}

const displayTime = _.invert(timeRange)

export default {
  namespace: 'performance/blockingWait',
  state: {
    timeRange: timeRange,
    displayTime: displayTime,
    chartData: [],
    chartTimeFilter:{
      radio: 'last_30_minutes',
      picker: []
    },
    tableTimeFilter:{
      radio: 'last_30_minutes',
      picker: [],
    },
    displayTableTime: '',  // 表格标题显示时间
    blockingWaitSorter: ['blocking_trx_started', 'descend'],
  },
  reducers: {
    handleLoad (state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    handleChartTimeFilter(state, action){
      return {
        ...state,
        chartTimeFilter: {
          ...state.chartTimeFilter,
          ...TimeFilter.parse(action.payload)
        }
      }
    },
    handleTableTimeFilter(state, action){  // 如果传的是数字时间戳而非包裹了的数组或者字符串time对象，则将tableTimeFilter的time设置为该数字时间戳（对应图中的点），否则对应更新picker或radio
      if (typeof(action.payload) === 'number') {
        return {
          ...state,
          tableTimeFilter: {
            ...state.tableTimeFilter,
            ...{time: action.payload}
          }
        }
      } else {
        const { time = 'last_30_minutes' } = action.payload
        return {
          ...state,
          tableTimeFilter: {
            ...state.tableTimeFilter,
            ...TimeFilter.parse(time)
          }
        }
      }
    },
    handleDisplayTableTime(state, action) {
      const time = ([moment.unix((+ new Date())/1000-30*60), moment.unix((+ new Date())/1000)]
        .map((v) => {return TimeFilter.format(v.unix())} )).join(' -- ')
      return {
        ...state,
        displayTableTime: action.payload || time
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
      const { time = 'last_30_minutes' } = payload;

      yield put({type: 'handleChartTimeFilter', payload: time});

      if(!currentNode){
        return false
      }

      const res = yield call(blockingWait, {hostname: currentNode, time })

      if (res.code === 0) {
        yield put({
          type: 'handleLoad',
          payload: {
            chartData: [{ type: 'line', option: {...res.data, xAxis:{show:false}} }]
          }
        })
      }

    },
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen(location => {
      if (/lock-wait/.test(location.pathname)) {
        const query = queryString.parse(location.search)
        dispatch({
          type: 'handleTableTimeFilter',
          payload: {
            time: query.point
          }
        })
        dispatch({
          type: 'handleDisplayTableTime',
          payload: query.point ? TimeFilter.format(query.point) : ''
        })
        dispatch({
          type: 'handleTableSorter',
          payload: {
            blockingWaitSorter: [query.sorter || 'blocking_trx_started', 'descend']
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
