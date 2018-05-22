import { hosts , trend} from 'services/monitor'

export default {
  namespace:'monitor/compare',
  state:{
    keys : {
    'cpu_use_rate': 'CPU利用率',
    'memory_use_rate': '内存利用率',
    'slave_lag': '主备延迟',
    'slow_queries': '慢查询',
    'cache_hit_rate': '缓存命中率',
    'mysql_space_usage': '磁盘空间使用量',
    'connects': '当前总连接数'
  },
    units : {
    'slave_lag': '主备延迟 单位:秒',
    'slow_queries': '慢查询 单位:次/秒',
    'cache_hit_rate': '缓存命中率 单位:%',
    'mysql_space_usage': '磁盘空间使用量 单位:GByte',
    'cpu_use_rate': 'CPU利用率 单位:%',
    'connects': '当前总连接数 单位:个',
    'memory_use_rate': '内存利用率 单位:%'
    },
    selectKey: ['cpu_use_rate'],
    oldKey:[],
    monitorData:[],
    machines:{},
    start: {
      machine: '',
      date: undefined
    },
    end: {
      machine: '',
      date: undefined
    },
    startTime:'',
    endTime:'',
    loading:false,
    state:false,
  },
  reducers:{
    handleSelectKey (state, action) {
      return {
        ...state,
        selectKey : action.payload.selectKey,
      }
    },
    handleMachines (state, action) {
      return {
        ...state,
        machines : action.payload,
      }
    },
    handleStartMachine (state, action) {
      return {
        ...state,
        machine:action.payload,
      }
    },
    handleEndMachine (state, action) {
      return {
        ...state,
        machine:action.payload,
    }
    },
    handleStartDate (state, action) {
      return {
        ...state,
        date:action.payload,
      }
    },
    handleEndDate (state, action) {
      return {
        ...state,
        date:action.payload,
      }
    },
    handleStartTime (state, action) {
      return {
        ...state,
        startTime:action.payload,
      }
    },
    handleEndTime (state, action) {
      return {
        ...state,
        endTime:action.payload,
      }
    },
    handleTrend (state, action) {
      return {
        ...state,
        monitorData:action.payload,
      }
    },
    handleOldKey (state, action) {
      return {
        ...state,
        oldKey:action.payload.oldKey,
      }
    },
  },
  effects:{
    *getHosts ({payload = {}, cluster = false }, { put, call }) {
      const res = yield call(hosts, payload)
      if (res.code === 0) {
        let data = res.data
        if(!cluster){
          if('ChunkKeeper' in data){
            data = res.data['MySQL/Nodeguard'];
          }else{
            data = res.data['MySQL'];
          }
        }
        yield put({
          type: 'handleMachines',
          payload: data
        })
      }
    },
    *getTrend ({payload = {}}, { put, call , select}) {
      const { monitorData } = yield select((state) => { return state['monitor/trend']})
      const {selectKey ,start ,end ,startTime ,endTime } = payload
      const res = yield call(trend, {selectKey:selectKey ,start:start ,end:end ,startTime:startTime ,endTime:endTime})
      if (res.code === 0) {
        res.data.map((d) => {
          monitorData[d['key']] = res.data[0]
        })
        yield put({
          type: 'handleTrend',
          payload: monitorData
        })
      }
    },
  },
  subscriptions:{

  },
}
