import { nodes } from 'services/monitor'

export default {
  namespace:'monitor/sort',
  state:{
    sort:{},
    selectKey: ['cpu_use_rate', 'memory_use_rate', 'slave_lag', 'slow_queries', 'cache_hit_rate', 'mysql_space_usage', 'connects'],
    keys :{
      'memory_use_rate': '内存利用率',
      'cpu_use_rate': 'CPU利用率',
      'slave_lag': '主备延迟',
      'slow_queries': '慢查询',
      'cache_hit_rate': '缓存命中率',
      'mysql_space_usage': '磁盘空间使用量',
      'connects': '当前总连接数'
    },
    loads: {
      'cpu_use_rate': true,
      'memory_use_rate': true,
      'slave_lag': true,
      'slow_queries': true,
      'cache_hit_rate': true,
      'mysql_space_usage': true,
      'connects': true
    },
    option:[],
    limit: '10',
    dataSet:[]

  },
  reducers:{
    handleLimit (state, action) {
      return {
        ...state,
        limit : action.payload,
      }
    },
    handleSelectKeyOption (state, action) {
      return {
        ...state,
        selectKey : action.payload.selectKey,
        option : action.payload.option,
      }
   },
    handleNodes (state, action) {
      return {
        ...state,
        option : action.payload,
      }
   },
    handleOption (state, action) {
      return {
        ...state,
        option : action.payload,
      }
    },
/*    handleTemOption (state, action) {
      return {
        ...state,
        option : action.payload,
      }
    },*/
  },
  effects:{
    *getNodes ({ payload = {} }, { put, call, select }) {
      const { option } = yield select((state) => { return state['monitor/sort']})
      const res = yield call(nodes, payload)
      if (res.code === 0) {
        option[res.data[0]['key']] = res.data
        yield put({
          type: 'handleNodes',
          payload: option
        })
      }
    },
    *getOption ({ payload = {} }, { put, call, select }) {
      const { selectKey , limit} = yield select((state) => { return state['monitor/sort']})

      const res = yield call(nodes, { selectKey: selectKey, limit: limit })

      if (res.code === 0) {
        const option = []

        option[res.data[0]['key']] = res.data
        //debugger
        yield put({
          type: 'handleOption',
          payload:option
        })
      }
    },
  },
  subscriptions:{
/*    setup ({ dispatch, history }) {
      history.listen(location => {
        if (/monitor([(\/)A-Za-z0-9_\\-]?)/.test(location.pathname)) {
          dispatch({type: 'getOption'})
          //dispatch({type: 'getSetting'})
        }
      })
    }*/
  },
}
