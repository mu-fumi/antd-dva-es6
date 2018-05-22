import { generateReport, getMysqlNodes, getReportError, getGrayList,
  settingDailyReport,getBusinesses,getStack,getApps,getClusters,getSets,getInstance,getNodes} from 'services/report'

import { Modal, message } from 'antd'
import {Logger,Cache,constant} from 'utils'
import _ from 'lodash'
const {RELATE_TYPE} = constant
const cookie = new Cache('cookie')
// 试图复用full的函数，发现函数可以正常调用，但函数中用到的变量，如接口，还是full的，这里覆盖不了
// const full = require('models/monitor/full')
// const { reducers, effects } = full
// const { getGrayList, handleSettingModal } = effects
// const { setGrayList, setSettingModal } = reducers

export default {
  namespace:'monitorDaily',
  state:{
    reload:(+ new Date()),
    pickerDefaultValue: [],  // picker的defaultValue，便于跳转别的页面然后从别的页面返回本页时保留筛选条件
    publishRange: [],
    node: '',  //节点名
    progress: '', //状态 初始为空，默认对应全部
    stack_id: '', //所属套件ID
    currentPage: 1,
    instances: {},
    retrying: false,
    grayList: [],
    settingModalValue: {},
    stackOptions: {},
    businessOptions: [],
    apps:[],
    relateList:[],
    nodes: [],
    business_id: '',
    app_id: '',
    relate_id: '',
    relate_type: '',
    keyword:'',
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
    handleNode (state, action) {
      return {
        ...state,
        node : action.payload
      }
    },
    resetFilter (state, action) {
      return {
        ...state,
        publishRange : [],
        progress:'',
        stack_id: '',
        report_type:'',
        relate_id: '',
        app_id: '',
        business_id: '',
        keyword: '',
      }
    },
    handleInstances (state, action) {
      return {
        ...state,
        instances : action.payload,
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
    setGrayList(state, action) {
      return {
        ...state,
        grayList: action.payload
      }
    },
    setSettingModal(state, action) {

      const {gray, interval, group_size, schedule, disabled} = action.payload
      return {
        ...state,
        settingModalValue: {
          gray,
          interval,
          group_size,
          schedule,
          disabled
        }
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
    clearQuery(state, action){
      debugger
      // todo  需要加入 可初始化白名单，名单外删除
      // todo 名单内的 为想好如何处理
      const allowFilter = ['keyword', 'alive', 'relate_id', 'relate_type', 'application_id', 'stack_id']
      const query = action.payload
      let {filter} = state
      Object.keys(query).forEach(key => {
        if (!allowFilter.includes(key)) {
          delete filter[key]
        }
      })
      return {
        ...state,
        filter: {...filter}
      }
    },
    setStackOptions(state, action){
      const data = action.payload
      let stack = {}
      data.forEach(v => {
        stack[v.name] = v.id
      })
      return {
        ...state,
        stackOptions: stack
      }
    },
    handleFilter(state, action) {
      return {
        ...state,
        ...action.payload
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
      const data = action.payload
      const relateList = data.map(v => {
        return {
          value : v.id,
          label : v.name
        }
      })
      return {
        ...state,
        relateList
      }
    },
    setNodes(state, action) {
      const data = action.payload.data
      const nodes = data.map(v => {
        return {
          value : v.id,
          label : v.report_node
        }
      })
      return {
        ...state,
        nodes
      }
    },
  },
  effects:{
    *getMysqlNodes ({ payload = {} }, { put, call, select }) {
      const res = yield call(getMysqlNodes, payload)
      // console.log(res)
      if (res && res.code === 0) {
        yield put({
          type: 'handleInstances',
          payload: _.isPlainObject(res.data) ? res.data : {}
        })
      }
    },
    *generateReport ({ payload = {} }, { put, call, select }) {
      // console.log(payload)
      const res = yield call(generateReport, payload)

      if (res && res.code === 0) {

        Modal.info({
          title: '生成巡检日报任务已经提交',
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
          type: 'handleReload',
        })
      } else {
        res && message.error(res.error || res.msg)
      }
    },
    *getReportError ({ payload = {} }, { put, call, select }) {
      // console.log(payload)
      return yield call(getReportError, payload)
    },
    *getGrayList({
                   payload
                 }, { call, put }){

      const res = yield call(getGrayList)
      if (res.code === 0) {
        yield put({
          type: 'setGrayList',
          payload: res.data
        })
      } else {
        message.error(res.error || res.msg)
      }
    },
    *handleSettingModal({
                          payload
                        }, { call, put }) {
      const res = yield call(settingDailyReport, payload)
      if (res.code === 0) {
        // 如果是 post 请求说明是提交设置，成功后需要关闭弹窗
        if(payload.method === 'post') {
          yield put({
            type: 'setSettingModalVisible',
            payload: false
          })
          message.success('调度配置保存成功')
        }
        yield put({
          type: 'setSettingModal',
          payload: res.data
        })
      } else {
        message.error(res.error || res.msg)
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
    *getStack({
                payload
              }, {put, call}){
      let res = yield call(getStack, payload)
      if (res.code === 0) {
        yield put({
          type: 'setStackOptions',
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
        res = yield call(getClusters, data)
      }else if(parseInt(type) === RELATE_TYPE['set']){
        res = yield call(getSets, data)
      }else if(parseInt(type) === RELATE_TYPE['instance']){
        res = yield call(getInstance, data)
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
    *getClusters({
                   payload
                 }, {put, call}){
      const res = yield call(getClusters, payload)
      if(res.code === 0){
        yield put({
          type : 'setClusters',
          payload : res.data
        })
      }else{
        message.error(res.msg || res.error)
      }
    },
    *getNodes({
                payload
              }, {put, call}){
      const res = yield call(getNodes, payload)
      if(res.code === 0){
        yield put({
          type : 'setNodes',
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
        type: 'getMysqlNodes',
      })
      dispatch({
        type: 'getGrayList'
      })
      dispatch({
        type: 'handleSettingModal',
        payload: {
          method: 'get'
        }
      })
      // 获取所属套件信息
      dispatch({
        type: 'getStack',
        payload: {
          paginate: 0
        }
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
