/**
 * Created by wengyian on 2017/9/8.
 */

import { message } from 'antd'
import { routerRedux } from 'dva/router'
import { getService, getConfig, addNode, getBusinesses,
  getApps, getClusters, getSets} from 'services/nodes'
import { Cache, constant } from 'utils'
import pathToRegexp from 'path-to-regexp'

const cookie = new Cache('cookie')
const { RELATE_TYPE } = constant

export default {
  namespace : 'nodes/add',
  state : {
    currentStep : 0,
    selectedBaseInfo: {
      business_id : '',
      app_id: '',
      cluster_id : '',
      service : [],
      relateType : RELATE_TYPE['cluster'],
      relateId : ''
    },
    selectedHost : {},
    keywords : {},
    serviceList : [],
    selectedService: [],
    preInfo : '',
    zabbixService : [],
    config : {},
    businesses : [],
    apps : [],
    clusters : [],
    selectedBusinessId : '',
    selectedAppId : '',
    selectedClusterId : '',
    tipModalVisible : false,
    spinning : false,
    hostIP : {},
    hostVisible : false,
    relateList : [],
    selectedRelateId : '',
    pages : {}, //保留筛选条件
  },
  reducers : {
    resetState(state, action){
      return {
        ...state,
        currentStep : 0,
        selectedBaseInfo: {
          business_id : '',
          app_id: '',
          cluster_id : '',
          service : [],
          relateType : RELATE_TYPE['cluster'],
          relateId : ''
        },
        selectedHost : {},
        keywords : {},
        serviceList : [],
        selectedService: [],
        preSelectedService : '',
        zabbixService : [],
        config : {},
        businesses : [],
        apps : [],
        clusters : [],
        selectedBusinessId : '',
        selectedAppId : '',
        selectedClusterId : '',
        tipModalVisible : false,
        spinning : false,
        relateList : [],
        selectedRelateId : '',
        pages : {}
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

    setBaseInfo(state, action){
      return {
        ...state,
        baseInfo : action.payload
      }
    },

    setSelectedBaseInfo(state, action){
      return {
        ...state,
        selectedBaseInfo: action.payload
      }
    },

    handleKeywords(state, action){
      return {
        ...state,
        keywords : {
          ...state.keywords,
          [action.payload.key] : action.payload.value
        }
      }
    },

    setSelectedHost(state, action){
      return {
        ...state,
        selectedHost : action.payload
      }
    },

    setService(state, action){
      const service = action.payload
      let zabbixService = service.find( v => v.service.toLowerCase() === 'zabbix-agent')
      if(zabbixService){
        zabbixService = [].concat(zabbixService.id)
      }else{
        zabbixService = []
      }
      return {
        ...state,
        // zabbixService,
        serviceList : action.payload
      }
    },

    setSelectedService(state, action){
      let selectedService = action.payload.map(v => {
        return state.serviceList.find(val => val.id == v)
      })
      return {
        ...state,
        selectedService : selectedService
      }
    },

    setPreAndClearHost(state, action){
      return {
        ...state,
        preInfo : action.payload,
        selectedHost : {}
      }
    },


    clearService(state, action){
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
    },

    clearCluster(state, action){
      return {
        ...state,
        clusters : [],
        selectedCluster : ''
      }
    },

    setConfig(state, action){
      return {
        ...state,
        config : {
          ...state.config,
          [action.payload.id] : action.payload.data
        }
      }
    },

    setBusinesses(state, action){
      // 只需要 {name, id}
      const params = action.payload
      // let { data = [] } = params
      const businesses = params.map(v => {
        return {
          id : v.id,
          name : v.name
        }
      })
      return {
        ...state,
        businesses : businesses
      }
    },

    setApps(state, action){
      // 只需要 {name, id}
      const params = action.payload
      // let { data = [] } = params
      const apps = params.map(v => {
        return {
          id : v.id,
          name : v.name
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
          id : v.id,
          name : v.name
        }
      })
      return {
        ...state,
        clusters
      }
    },

    toggleTipModalVisible(state, action){
      return {
        ...state,
        tipModalVisible : !state.tipModalVisible
      }
    },

    setSpinning(state, action){
      return {
        ...state,
        spinning : action.payload
      }
    },

    // 新增主机
    handleHostIP (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },

    toggleHostVisible(state, aciton){
      return {
        ...state,
        hostVisible : !state.hostVisible
      }
    },

    /******* 20171214 新增节点 第一步 集群 适配 实例组/集群*********/
    /******** cluster 相关方法修改为 relate *****/
    setRelateList(state, action){
      const data = action.payload
      const relateList = data.map(v => {
        return {
          id : v.id,
          name : v.name
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

    setFilter(state, action){
      const { keywords, pages} = action.payload
      return {
        ...state,
        keywords,
        pages
      }
    }
  },
  effects : {
    // *getBaseInfo({
    //   payload
    // }, { put, call}){
    //   let res =  yield call(getBaseInfo, payload)
    //   // todo fake res delete
    //   res  = {
    //     code : 0,
    //     data : {
    //       business : [{name : '业务1', id : 1},{name : '业务2', id : 2},{name : '业务3', id : 3}],
    //       app : [{name : '应用1', id : 1},{name : '应用2', id : 2},{name : '应用3', id : 3}],
    //       cluster : [{name : '集群1', id : 1},{name : '集群2', id : 2},{name : '集群3', id : 3}],
    //   }
    //   }
    //
    //   if(res.code === 0){
    //     yield put({
    //       type : 'setBaseInfo',
    //       payload : res.data
    //     })
    //   }else{
    //     message.error(res.msg || res.error)
    //   }
    // },

    *getService({
      payload
    }, { put, call }){
      let res = yield call(getService, payload)
      console.log('res===>', res)
      if(res.code === 0){
        yield put({
          type : 'setService',
          payload : res.data
        })
      }else{
        message.error(res.msg || res.error)
      }
    },

    *addNode({
      payload
    }, {put, call}){
      const res = yield call(addNode, payload)
      yield put({
        type : 'setSpinning',
        payload : false
      })
      if(res.code === 0){
        // message.success('成功新增节点')
        // yield put(routerRedux.push('/nodes'))
        yield put({
          type : 'toggleTipModalVisible'
        })
      }else{
        message.error(res.msg || res.error)
      }
    },

    *getConfig({
      payload
    }, {put, call}){
      const { relate_id, service_id, relate_type } = payload
      const ids = service_id || []
      for(let i = 0; i < ids.length; i++){
        const res = yield call(getConfig, {
          relate_id,
          relate_type,
          service_id : ids[i]
        })
        if(res.code === 0){
          yield put({
            type : 'setConfig',
            payload : {
              data : res.data,
              id : ids[i]
            }
          })
        }else{
          message.error(res.msg || res.error)
        }
      }
    },

    *getBusinesses({
      payload
    }, {put, call}){
      const res = yield call(getBusinesses, payload)
      if(res.code === 0){
        yield put({
          type : 'setBusinesses',
          payload : res.data
        })
      }else{
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


    /**********20171214 获取实例组/集群**********/
    *getRelateList({
      payload
    }, {put, call}){
      const { type, data } = payload
      let res = ''
      if(parseInt(type) === RELATE_TYPE['cluster']){
        res = yield call(getClusters, data)
      }else if(parseInt(type) === RELATE_TYPE['set']){
        res = yield call(getSets, data)
      }
      if(res.code === 0){
        yield put({
          type : 'setRelateList',
          payload : res.data
        })
      }else{
        message.error(res.msg || res.error)
      }
    }

  },
  subscriptions : {
    setup({dispatch, history}){
      // 获取 user_id
      history.listen(({pathname}) => {
        const match = pathToRegexp('/nodes/add').exec(pathname)
        if(match){
          const user_id = cookie.get('uid')
          dispatch({
            type : 'getBusinesses',
            payload : {
              user_id : user_id,
            }
          })
        }
      })
    }
  }
}
