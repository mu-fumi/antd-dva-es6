/**
 * Created by wengyian on 2017/8/15.
 */

import {
  getService, getConfig, getStackTags, deploy, getBusinesses,
  getApps, getMemoryRange, getTemplate, getQuorum
} from 'services/deploy'
import {Modal, message} from 'antd'
import {Link, routerRedux} from 'dva/router'
import pathToRegexp from 'path-to-regexp'
import _ from 'lodash'
import {Cache, convertUnit, constant} from 'utils'
import queryString from 'query-string'

const cache = new Cache('cookie')
const { QUORUM_TYPES } = constant

export default {
  namespace: 'deploy/create',
  state: {
    currentStep:0,
    serviceList: [],
    configList: {},
    deployInfo: {},
    hostFilterVisible: false,
    dataUrl: '',
    dataFilter: {
      keyword: '',
      tag: '',
      paginate: 1,
    },
    stackTags: [],
    hostList: {},
    selectedStack: [],
    selectedService: [],
    preSelectedService: '', //新增 针对重新选择服务后 之前的填写都没了
    spinning: false,
    businessList: [],
    appList: [],
    chunkKeeperList: [],
    zooKeeperList: [],
    tipModalVisible: false,
    memoryRange: {
      min: 1,
      max: 1,
      unit: 'M'
    },
    memoryMarks: {},
    hostIP: {},
    hostVisible: false,
    template : '',
  },
  reducers: {

    toggleTipModalVisible(state, action){
      const visible = state.tipModalVisible
      return {
        ...state,
        tipModalVisible: !visible
      }
    },

    plusCurrentStep(state, action){
      return {
        ...state,
        currentStep: state.currentStep + 1
      }
    },

    minusCurrentStep(state, action){
      return {
        ...state,
        currentStep: state.currentStep - 1
      }
    },

    setDeployInfo(state, action){
      return {
        ...state,
        deployInfo: action.payload
      }
    },

    clearDeployInfoService(state, action){
      return {
        ...state,
        deployInfo: {
          ...state.deployInfo,
          service: ''
        },
        serviceList: []
      }
    },

    initState(state, action){
      return {
        currentStep: 0,
        serviceList: [],
        configList: {},
        deployInfo: {},
        hostFilterVisible: false,
        dataUrl: '',
        dataFilter: {
          keyword: '',
          tag: '',
          paginate: 1,
        },
        stackTags: [],
        hostList: {},
        selectedStack: [],
        selectedService: [],
        spinning: false,
        businessList: [],
        appList: [],
        chunkKeeperList: [],
        zooKeeperList: [],
        tipModalVisible: false,
        memoryRange: {
          min: 1,
          max: 1,
          unit: 'M'
        },
        memoryMarks: {},
        hostIP: {},
        hostVisible: false,
        template : '',
      }
    },

    setService(state, action){
      return {
        ...state,
        serviceList: action.payload
      }
    },

    setConfig(state, action){
      return {
        ...state,
        configList: action.payload
      }
    },

    showHostFilter(state, action){
      return {
        ...state,
        hostFilterVisible: true
      }
    },

    hideHostFilter(state, action){
      return {
        ...state,
        hostFilterVisible: false
      }
    },

    handleFilter(state, action){
      return {
        ...state,
        dataFilter: {
          ...state.dataFilter,
          ...action.payload
        }
      }
    },

    setStackTags(state, action){
      return {
        ...state,
        stackTags: action.payload
      }
    },

    setSelectedStack(state, action){
      return {
        ...state,
        selectedStack: action.payload,
      }
    },

    clearMasterSlave(state, action){
      let oldConfigList = Object.assign({}, state.configList)
      const newConfigList = oldConfigList[action.payload].filter(v => v._key != 'master-_-slave')
      return {
        ...state,
        configList: {
          ...state.configList,
          [action.payload]: newConfigList
        }
      }
    },

    clearChunkConfig(state, action) {
      let oldConfigList = Object.assign({}, state.configList)
      const newConfigList = oldConfigList[action.payload].filter(v => v._key != 'chunk')
      return {
        ...state,
        configList: {
          ...state.configList,
          [action.payload]: newConfigList
        }
      }
    },


    selectedServiceHost(state, action){
      return {
        ...state,
        selectedService: action.payload,
      }
    },

    setSelectedService(state, action){
      let service_ids = action.payload.split(',')
      let selectedService = service_ids.map(val => {
        let index = state.serviceList.findIndex(item => Number(item.id) === Number(val))
        return state.serviceList[index]
      })
      return {
        ...state,
        preSelectedService: action.payload,
        selectedService: selectedService,
      }
    },

    setSpinning(state, action){
      return {
        ...state,
        spinning: action.payload
      }
    },

    setBusinesses(state, action){
      // 只需要 {name, id}
      const params = action.payload
      // let { data = [] } = params
      const businessList = params.map(v => {
        return {
          id: v.id,
          name: v.name
        }
      })
      return {
        ...state,
        businessList: businessList
      }
    },

    setApps(state, action){
      // 只需要 {name, id}
      const params = action.payload
      // let { data = [] } = params
      const appList = params.map(v => {
        return {
          id: v.id,
          name: v.name
        }
      })
      return {
        ...state,
        appList
      }
    },

    setMemoryRange(state, action){
      return {
        ...state,
        memoryRange: action.payload
      }
    },

    setMemoryMarks(state, action){
      let {min, max , unit} = action.payload
      // 最大最小值都是 2的 n 次幂
      // 获取最小值和最大值分别为 2 的几次方
      // 把数字转成二进制字符，长度 -1 就是 几次方
      if(!max){
        max = unit === "M" ? 32768 : 32
      }
      const minLength = min.toString(2).length - 1
      const maxLength = max.toString(2).length - 1
      const interval = maxLength - minLength + 1
      // const percent = parseInt(100 / (interval - 1))
      const convertMin = convertUnit(min, unit)
      const convertMax = convertUnit(max, unit)
      let marks = {
        0: convertMin,
        100: convertMax
      }
      let marksArr = []
      for (let i = 1; i < interval - 1; i++) {
        const num = Math.pow(2, i + minLength)
        const convertNum = convertUnit(num, unit)
        if(convertNum.slice(-1).toUpperCase() === 'M'){
          const backNum = convertNum.slice(0, -1)
          if(backNum >= 256){
            marksArr.push(convertNum)
          }
        }else if(convertNum.slice(-1).toUpperCase() === 'G'){
          marksArr.push(convertNum)
        }
      }
      for( let i = 0; i < marksArr.length; i++ ){
        const percent = parseInt(100 / (marksArr.length + 1))
        const marksKey = percent * (i + 1)
        marks[marksKey] = marksArr[i]
      }
      return {
        ...state,
        memoryMarks: marks
      }
    },

    // 新增主机
    handleHostIP (state, action) {
      return {
        ...state,
        ...action.payload
      }
    },

    toggleHostVisible(state, action){
      return {
        ...state,
        hostVisible: !state.hostVisible
      }
    },

    /**********20171211 需求： 参数模板*****************/
    setTemplate(state, action){
      return {
        ...state,
        template : action.payload[0]
      }
    },

    /**********20171212 赋值 quorum 列表************/
    setChunkKeeperList(state, action){
      return {
        ...state,
        chunkKeeperList : action.payload
      }
    },

    setZooKeeperList(state, action){
      return {
        ...state,
        zooKeeperList : action.payload
      }
    },

  },
  effects: {
    *getService({
                  payload
                }, {put, call}){
      let res = yield call(getService, payload)
      if (res.code === 0) {
        yield put({
          type: 'setService',
          payload: res.data
        })
      } else {
        message.error(res.msg || res.error)
      }
    },

    *getConfig({
                 payload
               }, {put, call}){
      let res = yield call(getConfig, payload)
      if (res.code === 0) {
        yield put({
          type: 'setConfig',
          payload: res.data
        })
      }
    },

    *getStackTags({
                    payload
                  }, {put, call}){
      const res = yield call(getStackTags)
      if (res.code === 0) {
        yield put({
          type: 'setStackTags',
          payload: res.data
        })
      } else {
        message.error(res.error || res.msg)
      }
    },

    *deploy({
              payload
            }, {put, call}){
      const res = yield call(deploy, payload)
      if (res.code === 0) {
        yield put({
          type: 'setSpinning',
          payload: false
        })
        // yield put(routerRedux.push('/deploy'))
        yield put({
          type: 'toggleTipModalVisible'
        })
      } else {
        yield put({
          type: 'setSpinning',
          payload: false
        })
        message.error(res.error || res.msg)
      }
    },

    *getBusinesses({
                     payload
                   }, {put, call}){
      const res = yield call(getBusinesses, payload)
      if (res.code === 0) {
        yield put({
          type: 'setBusinesses',
          payload: res.data
        })
      } else {
        message.error(res.error || res.msg)
      }
    },

    *getApps({
               payload
             }, {put, call}){
      const res = yield call(getApps, payload)
      if (res.code === 0) {
        yield put({
          type: 'setApps',
          payload: res.data
        })
      } else {
        message.error(res.error || res.msg)
      }
    },

    *getMemoryRange({
                      payload
                    }, {put, call}){
      const res = yield call(getMemoryRange, payload)
      if (res.code === 0) {
        yield put({
          type: 'setMemoryMarks',
          payload: res.data
        })
      } else {
        message.error(res.error || res.msg)
      }
    },

    /***************20171211 需求：部署增加几种模板 **********************/
    /**************  不同模板第二步基本信息不一致 **********************/
    *getTemplate({
      payload
    }, { put, call }){
      const res = yield call(getTemplate, payload)
      if(res.code === 0){
        yield put({
          type : 'setTemplate',
          payload : res.data
        })
        if(res.data[0] === 'HCFDB'){
          yield put({
            type : 'getQuorum',
            payload : {
              type : QUORUM_TYPES['CHUNKKEEPER'],
              all : true,
            }
          })
          yield put({
            type : 'getQuorum',
            payload : {
              type : QUORUM_TYPES['ZOOKEEPER'],
              all : true,
            }
          })
        }
      }else{
        message.error(res.error || res.msg)
      }
    },

    /**********20171212 获取 quorum 列表************/
    *getQuorum({
      payload
    }, { put, call }){
      const res = yield call(getQuorum, payload)
      if(res.code === 0){
        const { type } = payload
        if(type === QUORUM_TYPES['CHUNKKEEPER']){
          yield put({
            type : 'setChunkKeeperList',
            payload : res.data
          })
        }else if(type === QUORUM_TYPES['ZOOKEEPER']){
          yield put({
            type : 'setZooKeeperList',
            payload : res.data
          })
        }
      }else{
        message.error(res.error || res.msg)
      }
    }
  },
  subscriptions: {
    setup({dispatch, history}){
      history.listen(({pathname, search}) => {
        const match = pathToRegexp('/deploy/create').exec(pathname)
        const query = queryString.parse(search)
        if (match) {
          let {tag = ''} = query
          if (tag === 'instance') {
            tag = '实例'
          } else if (tag === 'cluster') {
            tag = '集群'
          } else if (tag === 'set') {
            tag = '实例组'
          }
          dispatch({
            type: 'handleFilter',
            payload: {
              tag: tag
            }
          })
          dispatch({
            type: 'getStackTags'
          })
          const userId = cache.get('uid')
          dispatch({
            type: 'getBusinesses',
            payload: {
              user_id: userId
            }
          })
        }
      })
    }
  }
}
