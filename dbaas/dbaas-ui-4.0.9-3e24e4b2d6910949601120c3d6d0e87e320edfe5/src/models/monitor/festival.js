import { generateReport, getGrayList as getInstances ,getCluster,getInstance1,getSet, getBusinesses,getApps} from 'services/report'
import { Modal, message } from 'antd'
import {Cache,constant} from 'utils'
const {RELATE_TYPE} = constant
const cookie = new Cache('cookie')
export default {
  namespace:'monitorFestival',
  state:{
    reload:(+ new Date()),
    pickerDefaultValue: [],  // picker的defaultValue，便于跳转别的页面然后从别的页面返回本页时保留筛选条件
    publishRange: [],
    currentPage: 1,
    retrying: false,
    buttonLoading: false,
    progress: '',
    instances: [],
    clusters: [],
    sets: [],
    businessOptions: [],
    apps: [],
    selectedBaseInfo: {
      business_id : '',
      app_id: '',
      cluster_id : '',
      relateType : RELATE_TYPE['cluster'],
      relateId : '',
    },
  },
  reducers:{
    handleReload (state) {
      return {
        ...state,
        reload: (+ new Date()),
      }
    },
    handlePublishRange (state, action) {
      return {
        ...state,
        publishRange : action.payload
      }
    },
    handleInstances (state, action) {
      return {
        ...state,
        instances : action.payload,
      }
    },
    handleState (state, action) {
      return {
        ...state,
        progress : action.payload
      }
    },
    handleFilter(state,action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handlePickerDefaultValue (state, action) {
      return {
        ...state,
        pickerDefaultValue: action.payload
      }
    },
    setCurrentPage (state, action) {
      return {
        ...state,
        currentPage: action.payload
      }
    },
    handleRetrying (state, action) {
      return {
        ...state,
        retrying: action.payload
      }
    },
    setCluster(state, action){
      // 只需要 {name, id}
      const data = action.payload.data
      const clusters = data.map(v => {
        return {
          value : v.id,
          label : v.cluster_name
        }
      })
      return {
        ...state,
        clusters
      }
    },
    setInstance(state, action){
      // 只需要 {name, id}
      const data = action.payload.data
      const instances = data.map(v => {
        return {
          value : v.id,
          label : v.cluster_name
        }
      })
      return {
        ...state,
        instances
      }
    },
    setSet(state, action){
      // 只需要 {name, id}
      const data = action.payload.data
      const sets = data.map(v => {
        return {
          value : v.id,
          label : v.cluster_name
        }
      })
      return {
        ...state,
        sets
      }
    },
    setBusinessOptions(state, action){
      const data = action.payload
      const businessOptions = data.map(v => {
        return {
          label: v.name,
          value: v.id,
          isLeaf: false
        }
      })
      return {
        ...state,
        businessOptions,
      }
    },
    setApps(state, action){
      // 只需要 {name, id}
      const params = action.payload
      // let { data = [] } = params
      const apps = params.map(v => {
        return {
          value : v.id,
          label : v.name
        }
      })
      return {
        ...state,
        apps
      }
    },
    setRelateList(state, action){
      const data = action.payload.data
      const instances = data.map(v => {
        return {
          value : v.id,
          label : v.cluster_name
        }
      })
      return {
        ...state,
        instances
      }
    },
  },
  effects:{
    /**getInstances ({ payload = {} }, { put, call, select }) {
      const res = yield call(getInstances, payload)
      if (res && res.code === 0) {
        yield put({
          type: 'handleInstances',
          payload: res.data.map(v => v.instance_name)
        })
      } else {
        res && message.error(res.error || res.msg)
      }
    },*/
    *generateReport ({ payload = {} }, { put, call, select }) {
      const { retrying } = yield select(state => state['monitorFestival'])
      const res = yield call(generateReport, payload)

      if (res && res.code === 0) {

        let retryTag = ''
        if (retrying) {
          retryTag = '重新'
        }
        Modal.info({  // 因生产报告和重新生成报告复用了此modal.info，所以放在generateReport而不是route里
          title: `${retryTag}生成节前巡检报告任务已经提交`,
          content: < p > 提交成功,
            本次任务已在后台执行,
            耗时较长,
            您稍候可以在任务列表查看进度及结果 </p>,
          onOk: () => {
          },
          onCancel: () => {
          }
        })
        yield put({
          type: 'handleRetrying',
          payload: false
        })
        yield put({
          type: 'handleReload',
        })
      } else {
        res && message.error(res.error || res.msg)
      }
    },
    *getCluster({
                   payload
                 }, {put, call}){
      const res = yield call(getCluster)
      if(res.code === 0){
        yield put({
          type : 'setCluster',
          payload : res.data
        })
      }else{
        message.error(res.msg || res.error)
      }
    },
    *getInstance({
                  payload
                }, {put, call}){
      const res = yield call(getInstance1)
      if(res.code === 0){
        yield put({
          type : 'setInstance',
          payload : res.data
        })
      }else{
        message.error(res.msg || res.error)
      }
    },
    *getSet({
                   payload
                 }, {put, call}){
      const res = yield call(getSet)
      if(res.code === 0){
        yield put({
          type : 'setSet',
          payload : res.data
        })
      }else{
        message.error(res.msg || res.error)
      }
    },
    *getBusinesses({
                     payload
                   }, {put, call}){
      let res = yield call(getBusinesses, payload)
      if (res.code === 0) {
        yield put({
          type: 'setBusinessOptions',
          payload: res.data
        })
      } else {
        message.error(res.msg || res.error)
      }
    },
    *getApps({
               payload
             }, {put, call}){
      const res = yield call(getApps, payload)
      if(res.code === 0){
        yield put({
          type : 'setApps',
          payload : res.data
        })
      }else{
        message.error(res.msg || res.error)
      }
    },
    *getRelateList({
                     payload
                   }, {put, call}){
      const { type, data } = payload
      let res = ''
      if(parseInt(type) === RELATE_TYPE['cluster']){
        res = yield call(getCluster, data)
      }else if(parseInt(type) === RELATE_TYPE['set']){
        res = yield call(getSet, data)
      }else if(parseInt(type) === RELATE_TYPE['instance']){
        res = yield call(getInstance1, data)
      }
      if(res.code === 0){
        yield put({
          type : 'setRelateList',
          payload : res.data
        })
      }else{
        message.error(res.msg || res.error)
      }
    },
  },
  subscriptions:{
    setup ({ dispatch, history }) {
      dispatch({
        type: 'getCluster',
      })
      // 获取所属信息
      const user_id = cookie.get('uid')
      dispatch({
        type: 'getBusinesses',
        payload: {
          user_id: user_id,
        }
      })
    }
  },
}
