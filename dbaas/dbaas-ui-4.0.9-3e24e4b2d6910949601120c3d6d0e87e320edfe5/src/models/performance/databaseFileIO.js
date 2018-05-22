
import { Menu, TimeFilter } from 'utils'
import { IOBytes, IOLatency } from 'services/performance'

export default {
  namespace: 'performance/databaseFileIO',
  state: {
    fileCardShow: '',
    fileReload: (+ new Date())/1000,
    currentFile: '',
    fileFilter:{
      radio: 'last_30_minutes',
      picker: []
    },
    fileBytesChart: { span: 12, type: 'line', option: {title: 'innodb-bytes', values:[]} },
    fileLatencyChart: { span: 12, type: 'line', option: {title: 'innodb-latency', values:[]} },
    waitTypeCardShow: '',
    waitTypeReload: (+ new Date())/1000,
    currentIOType: '',
    waitTypeFilter:{
      radio: 'last_30_minutes',
      picker: []
    },
    waitTypeBytesChart: { span: 12, type: 'line', option: {title: 'innodb-bytes', values:[]} },
    waitTypeLatencyChart: { span: 12, type: 'line', option: {title: 'innodb-bytes', values:[]} },
    threadCardShow: '',
    threadReload: (+ new Date())/1000,
    currentThread: '',
    threadFilter:{
      radio: 'last_30_minutes',
      picker: []
    },
    threadBytesChart: { span: 12, type: 'line', option: {title: 'innodb-bytes', values:[]} },
    threadLatencyChart: { span: 12, type: 'line', option: {title: 'innodb-bytes', values:[]} },
    fileSorter: ['total_latency', 'descend'],
    waitTypeSorter: ['total_latency', 'descend'],
    threadSorter: ['total_latency', 'descend'],
  },
  reducers: {
    handleLoad (state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    handleFileReload (state) {
      return {
        ...state,
        fileReload: (+ new Date())/1000,
      }
    },
    handleCurrentFile (state, action) {
      return {
        ...state,
        currentFile: action.payload
      }
    },
    handleFileFilter(state, action){
      return {
        ...state,
        fileFilter: TimeFilter.parse(action.payload)
      }
    },
    handleWaitTypeReload (state) {
      return {
        ...state,
        waitTypeReload: (+ new Date())/1000,
      }
    },
    handleCurrentIOType (state, action) {
      return {
        ...state,
        currentIOType: action.payload
      }
    },
    handleWaitTypeFilter(state, action){
      return {
        ...state,
        waitTypeFilter: TimeFilter.parse(action.payload)
      }
    },
    handleThreadReload (state) {
      return {
        ...state,
        threadReload: (+ new Date())/1000,
      }
    },
    handleCurrentThread (state, action) {
      return {
        ...state,
        currentThread: action.payload
      }
    },
    handleThreadFilter(state, action){
      return {
        ...state,
        threadFilter: TimeFilter.parse(action.payload)
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
    *getFileChart ({ payload = {} }, { put, call, select}) {
      const { currentNode } = yield select((state) => { return state['performance']})
      const { currentFile } = yield select((state) => { return state['performance/databaseFileIO']})
      const { time = 'last_30_minutes' } = payload

      yield put({type: 'handleFileFilter', payload: time })

      if(!currentNode){
        return false
      }

      const res1 = yield call(IOBytes, {hostname: currentNode, time, type: 'io_file', table: currentFile })

      if (res1.code === 0) {
        if (Array.isArray(res1.data)) {
          yield put({
            type: 'handleLoad',
            payload: {
              fileCardShow: ''
            }
          })
        } else {
          yield put({
            type: 'handleLoad',
            payload: {
              fileBytesChart: {span: 12, type: 'line', option: res1.data},
              fileCardShow: 'show'
            }
          })
        }
      }

      const res2 = yield call(IOLatency, {hostname: currentNode, time, type: 'io_file', table: currentFile })

      if (res2.code === 0) {
        if (Array.isArray(res2.data)) {
          yield put({
            type: 'handleLoad',
            payload: {
              fileCardShow: ''
            }
          })
        } else {
          yield put({
            type: 'handleLoad',
            payload: {
              fileLatencyChart: {span: 12, type: 'line', option: res2.data},
              fileCardShow: 'show'
            }
          })
        }
      }
    },

    *getWaitTypeChart ({ payload = {} }, { put, call, select}) {
      const { currentNode } = yield select((state) => { return state['performance']})
      const { currentIOType } = yield select((state) => { return state['performance/databaseFileIO']})
      const { time = 'last_30_minutes' } = payload

      if(!currentNode){
        return false
      }

      yield put({type: 'handleWaitTypeFilter', payload: time })

      const res1 = yield call(IOBytes, {hostname: currentNode, time, type: 'io_waits', table: currentIOType })

      if (res1.code === 0) {
        if (Array.isArray(res1.data)) {
          yield put({
            type: 'handleLoad',
            payload: {
              waitTypeCardShow: ''
            }
          })
        } else {
          yield put({
            type: 'handleLoad',
            payload: {
              waitTypeBytesChart: {span: 12, type: 'line', option: res1.data},
              waitTypeCardShow: 'show'
            }
          })
        }
      }

      const res2 = yield call(IOLatency, {hostname: currentNode, time, type: 'io_waits', table: currentIOType })

      if (res2.code === 0) {
        if (Array.isArray(res2.data)) {
          yield put({
            type: 'handleLoad',
            payload: {
              waitTypeCardShow: ''
            }
          })
        } else {
          yield put({
            type: 'handleLoad',
            payload: {
              waitTypeLatencyChart: { span: 12, type: 'line', option: res2.data },
              waitTypeCardShow: 'show'
            }
          })
        }
      }

    },

    *getThreadChart ({ payload = {} }, { put, call, select}) {
      const { currentNode } = yield select((state) => { return state['performance']})
      const { currentThread } = yield select((state) => { return state['performance/databaseFileIO']})
      const { time = 'last_30_minutes' } = payload

      yield put({type: 'handleThreadFilter', payload: time })

      if(!currentNode){
        return false
      }

      const res1 = yield call(IOBytes, {hostname: currentNode, time, type: 'io_thread', table: currentThread })

      if (res1.code === 0) {
        if (Array.isArray(res1.data)) {
          yield put({
            type: 'handleLoad',
            payload: {
              threadCardShow: ''
            }
          })
        } else {
          yield put({
            type: 'handleLoad',
            payload: {
              threadBytesChart: {span: 12, type: 'line', option: res1.data},
              threadCardShow: 'show'
            }
          })
        }
      }

      const res2 = yield call(IOLatency, {hostname: currentNode, time, type: 'io_thread', table: currentThread })

      if (res2.code === 0) {
        if (Array.isArray(res2.data)) {
          yield put({
            type: 'handleLoad',
            payload: {
              threadCardShow: ''
            }
          })
        } else {
          yield put({
            type: 'handleLoad',
            payload: {
              threadLatencyChart: { span: 12, type: 'line', option: res2.data },
              threadCardShow: 'show'
            }
          })
        }
      }
    },
  },

  subscriptions: {
    setup ({ dispatch }) {
      dispatch({ type: 'getFileChart' })
      dispatch({ type: 'getWaitTypeChart' })
      dispatch({ type: 'getThreadChart' })
    }
  }
}
