/**
 * Created by wengyian on 2018/3/27.
 */


import {message, Modal, Row} from 'antd'
import { getReportError, generateReport,
  getGrayList, settingReport,getStack,getBusinesses,getApps,getClusters,getSets,getNodes,getInstance} from 'services/report'
import pathToRegexp from 'path-to-regexp'
import {Logger,Cache,constant} from 'utils'
const cookie = new Cache('cookie')
const { RELATE_TYPE } = constant
export default {
  // 如果namespace 带 / ，那么 effects 返回的就不是 promise 对象了
  namespace: 'fullCheck',
  state: {
    reload: (+ new Date()),
    filter: {
      publish_range: '',
      report_type: 'basic,deep',
      node_name: '',
      node_type: '',
      keyword: '',
      alive: '',
      progress: '',
      relate_id: '',
      relate_type: '',
      application_id: '',
      stack_id: '',
      status : '',
      business_id: '',
    },
    selectedBaseInfo: {
      business_id : '',
      app_id: '',
      cluster_id : '',
      service : [],
      relateType : RELATE_TYPE['cluster'],
      relateId : '',
      node_id: '',
      belong_id: '',
    },
    serviceList : [],
    selectedService : [],
    preSelectedService : '',
    modalVisible: false,
    stackOptions: {},
    businessOptions: [],
    settingModalVisible: false,
    settingModalValue: {},
    grayList: [],
    apps: [],
    clusters: [],
    relateList : [],
    selectedRelateId : '',
    nodes: [],
    isShow:false,

  },
  reducers: {
    handleReload(state){
      return{
        ...state,
        reload:(+new Date())
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
    clearRelate(state, action){
      return {
        ...state,
        relateList : [],
        selectedRelateId : ''
      }
    },

    handleResetFilter(state, action) {
      return {
        ...state,
        filter: {
          publish_range: '',
          report_type: 'basic,deep',
          keyword: '',
          node_type: ''
        }
      }
    },
    /*clearService(state, action){
      return {
        ...state,
        serviceList : [],
        selectedService : [],
        preSelectedService : '',
        selectedBaseInfo : {
          ...state.selectedBaseInfo,
          service : []
        }
      }
    },*/
    handleFilter(state, action) {
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload
        }
      }
    },

    setModalVisible(state, action) {
      return {
        ...state,
        modalVisible: action.payload
      }
    },

    setSettingModalVisible(state, action) {
      return {
        ...state,
        settingModalVisible: action.payload
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
    clearQuery(state, action){
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
    setClusters(state, action){
      // 只需要 {name, id}
      const data = action.payload
      const clusters = data.map(v => {
        return {
          value : v.id,
          label : v.name
        }
      })
      return {
        ...state,
        clusters
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
  effects: {
    *getReportError({
                      payload
                    }, { call, put}){
      const res = yield call(getReportError, payload)
      if (res.code === 0) {
        const { error_info, link } = res.data
        const content = <Row>
          <Row>{error_info}</Row>
          <Row>
            <a className="text-info" href={`/job/${link}`} target="_blank">查看详情</a>
          </Row>
        </Row>
        Modal.info({
          title: '错误原因',
          content,
        })
      } else {
        message.error(res.error || res.msg)
      }
    },

    *generateReport({
                      payload
                    }, { call, put }){
      return yield call(generateReport, payload)
      /* if (res.code === 0) {
           Modal.info({
             title: '生成一键检查报告任务已经提交',
             content: '提交成功,本次任务已在后台执行,耗时较长,您稍候可以在任务列表查看进度及结果',
             okText: '知道了',
             onOk: () => {}
         })
       } else {
         message.error(res.error || res.msg)
       }*/
    },

  /*  *getNodes({
                payload
              }, { call, put }){
      const res = yield call(getNodes)
      if (res.code === 0) {
        const nodes = res.data['MySQL'] || res.data['MySQL/Nodeguard']
        yield put({
          type: 'setNodes',
          payload: nodes
        })
      } else {
        message.error(res.error || res.msg)
      }
    },*/
   // 获取灰度列表
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
      const res = yield call(settingReport, payload)
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
    *getRelateList({
                     payload
                   }, {put, call}){
      const { type, data } = payload
      let res = ''
      console.log('relateddddddddd',type)
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
  subscriptions: {
    setup({dispatch, history}){
      history.listen(({pathname, search}) => {
        const match = pathToRegexp('/checkup/full').exec(pathname)

        if (match) {
         /* dispatch({
            type: 'getNodes'
          })*/
         /* dispatch({
            type: 'getGrayList'
          })*/
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
      })
    }
  }
}

