/**
 *
 * @copyright(c) 2017
 * @created by lizzy
 * @package dbaas-ui
 * @version :  2017-05-31 14:34 $
 */

import { TimeFilter, Cache } from 'utils'
import { graph } from 'services/performance'
import { getBusinesses, getApps } from 'services/nodes'
import { getApplications, trendTags, getKeys, getCards, getBelongings, getNodes, getBelongs, getHosts } from 'services/monitor'
import { message } from 'antd'
import { routerRedux } from 'dva/router'
const queryString = require('query-string')

const cookie = new Cache('cookie')

export default {
  namespace: 'monitor/trend',
  state: {
    reload: (+ new Date()),
    timeRange: {
      '实时': 'last_30_minutes',
      '最近24小时': 'last_24_hours',
      '最近7天': 'last_7_days',
    },
    time:{
      radio: 'last_30_minutes',
      picker: []
    },
    advancedSearch: false,
    keyword: '',
    simpleNodes: [],
    complexNodes: [],
    selectedSimpleNodes: [],
    selectedComplexNodes: [],   // 当前选中节点
    selectedComplexNodesForTag: [],   // 所选节点（所有选中节点累加）
    instances: [],
    applications: [],
    tags: {},
    selectAllTag: false, // 初始不知道有哪些项，用null，会无法获取selectAllTag[application]，所以用false，后续需要重构
    keys: [],
    total: 0,
    currentPage: 1,
    businesses : [],
    apps : [],
    clusters: {},
    sets: {},
    selectContents: {}, // 三选一待选项
    selectedBusiness: '',
    selectedApp: '',
    selectedContent: '',
    relateType: '0',  // 三选一类型
    relateId: '',   // 三选一id
    hostname: [],  // 搜索时才更新graph参数中的节点,
    nodeType: 'host', // 当前搜索的是主机（'host'）还是节点（'node'）
    hasQuery: false,  // 从集群管理跳过来带query,
    hostNameIdRelations:{},  // 因getCards接口需要host_id,因此每次获取host都要添加进host的name和id映射中
    nodeNameIdRelations:{}   // 因getCards接口需要node_id,因此每次获取host都要添加进node的name和id映射中
  },
  reducers: {
    handleReload(state){  //  点击搜索更新chart
      return {
        ...state,
        reload: (+ new Date()),
      }
    },
    reload(state, action){  //  更新时间参数来更新chart
      const { time = 'last_30_minutes' } = action.payload
      return {
        ...state,
        time: TimeFilter.parse(time)
      }
    },
    nodeList (state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    instanceList (state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    showAdvancedSearch (state) {
      return {
        ...state,
        advancedSearch: true,
      }
    },
    hideAdvancedSearch (state) {
      return {
        ...state,
        advancedSearch: false,
      }
    },
    setApplications(state, action) {
      return {
        ...state,
        applications: action.payload
      }
    },
    setTags(state, action) {
      return {
        ...state,
        tags: {
          ...state.tags,
          ...action.payload
        }
      }
    },
    handleTags (state, action) {  //  只处理全选全不选以外的情况
      // const selectAll = action.payload.tag === 'all'
      // const selectNone = action.payload.tag === 'none'
      state['tags'][action.payload.application+'Tags'].forEach((v)=>{
        // if (selectAll) {   //  全选时其他所有tag都显示为不选，但发送给后台的为选中
        //   v.checked = true
        //   return
        // }
        // if (selectNone) {   //  反选全选时其他所有tag都显示为不选，发送给后台的也为全部不选
        //   v.checked = false
        //   return
        // }
        if (!v.checked) {
          v.checked = false  // 初始无checked，初始化为false
        }
        if (v.tag === action.payload.tag) {  // 选中项反选
          v.checked = !v.checked
        }
      })
      return {
        ...state,
        tags: {
          ...state.tags,
          [action.payload.application+'Tags']: state['tags'][action.payload.application+'Tags'],
        }
      }
    },
    selectAllTags (state, action) {  //  model层对应application全选
      state['tags'][action.payload.application+'Tags'].forEach((v)=>{
         //  全选时其他所有tag都显示为不选，但发送给后台的为选中
          v.checked = true
      })
      return {
        ...state,
        tags: {
          ...state.tags,
          [action.payload.application+'Tags']: state['tags'][action.payload.application+'Tags'],
        }
      }
    },
    // deSelectAllTags (state, action) {
    //   state['tags'][action.payload.application+'Tags'].forEach((v)=>{
    //     //  全选时其他所有tag都显示为不选，但发送给后台的为选中
    //     v.checked = false
    //   })
    //   return {
    //     ...state,
    //     tags: {
    //       ...state.tags,
    //       [action.payload.application+'Tags']: state['tags'][action.payload.application+'Tags'],
    //     }
    //   }
    // },
    handleSelectAllTag (state, action) { // 更新视图层对应那个全部选中状态
      return {
        ...state,
        selectAllTag: {
          ...state.selectAllTag,
          [action.payload.application]: action.payload.selectAll
        }
      }
    },
    clearSelectAllTag (state, action) { // 清除所有选中全部
      Object.keys(state.selectAllTag).forEach(v => {
        state.selectAllTag[v] = false
      })
      return {
        ...state,
        selectAllTag: {
          selectAllTag: state.selectAllTag,
        }
      }
    },
    clearTags (state, action) {  //  model层对应application全部反选
      state['tags'][action.payload.application+'Tags'].forEach((v)=> {
        v.checked = false
      })
      return {
        ...state,
        tags: {
          ...state.tags,
          [action.payload.application+'Tags']: state['tags'][action.payload.application+'Tags'],
        }
      }
    },
    clearAllTags (state, action) {  //  model层对应清除所有监控项tag
      Object.keys(state['tags']).forEach((v)=> {
        state['tags'][v].forEach(k => {
          k.checked = false
        })
      })
      return {
        ...state,
        tags: state.tags,
      }
    },
    getGraphKeys (state, action) {
      return {
        ...state,
        keys: action.payload,
      }
    },
    getTotal (state, action) {
      return {
        ...state,
        total: action.payload,
      }
    },
    setCurrentPage (state, action) {
      return {
        ...state,
        currentPage: action.payload,
      }
    },
    // updateCurrentNodes (state, action) {
    //   return {
    //     ...state,
    //     currentNodes: action.payload,
    //   }
    // },
    setSelectedSimpleNodes (state, action) {
      return {
        ...state,
        selectedSimpleNodes: action.payload,
      }
    },
    setSelectedComplexNodes (state, action) {
      return {
        ...state,
        selectedComplexNodes: action.payload
      }
    },
    addSelectedComplexNodesForTag (state, action) {  // 所有选中节点累加
      let selectedComplexNodesForTag = state.selectedComplexNodesForTag.concat(action.payload)
      selectedComplexNodesForTag = [...new Set(selectedComplexNodesForTag)]  //  去重
      return {
        ...state,
        selectedComplexNodesForTag: selectedComplexNodesForTag,
        // selectedComplexNodesForTag: action.payload
      }
    },
    setSelectedComplexNodesForTag (state, action) {
      return {
        ...state,
        selectedComplexNodesForTag: action.payload
      }
    },
    setKeyword (state, action) {
      return {
        ...state,
        keyword: action.payload,
      }
    },

    setBusinesses(state, action){
      return {
        ...state,
        businesses: action.payload
      }
    },

    setApps(state, action){
      return {
        ...state,
        apps: action.payload
      }
    },
    setAllSelectContents(state, action){
      // 三选一各项的待选项
      return {
        ...state,
        ...action.payload
      }
    },
    setSelectContents(state, action){
      // 当前三选一待选项
      return {
        ...state,
        selectContents: action.payload  // 默认值是集群
      }
    },
    clearSelectContents(state){
      return {
        ...state,
        clusters: {},
        sets: {},
        instances: {},
        selectContents: {}
      }
    },
    setRelateType(state, action) {
      return {
        ...state,
        relateType: String(action.payload)
      }
    },

    setRelateId(state, action) {
      return {
        ...state,
        relateId: action.payload
      }
    },

    setSimpleNodes(state, action) {
      return {
        ...state,
        simpleNodes: action.payload
      }
    },

    setComplexNodes(state, action) {
      return {
        ...state,
        complexNodes: action.payload
      }
    },
    setHostname(state, action) {
      return {
        ...state,
        hostname: action.payload
      }
    },
    setNodeType(state, action) {
      return {
        ...state,
        nodeType: action.payload
      }
    },
    setSelectedBusiness(state, action) {
      return {
        ...state,
        selectedBusiness: action.payload
      }
    },
    setSelectedApp(state, action) {
      return {
        ...state,
        selectedApp: action.payload
      }
    },
    setSelectedContent(state, action) {
      return {
        ...state,
        selectedContent: action.payload
      }
    },
    setHasQuery(state, action) {
      return {
        ...state,
        hasQuery: action.payload
      }
    },

    // 如果选中hostname改为包含id及name的对象，则所有相关的数据类型，使用这些数据类型的增删改查函数都要进行修改，所以这里折中为每次获取host时存储进映射中，需要发送id作为参数时，从此映射中获取
    handleHostNameIdRelations(state, action) {
      if (Array.isArray(action.payload)) {  //  是数组时要一个个加为映射
        action.payload.forEach(v => {
          state.hostNameIdRelations[v['name']] = v['id']
        })
      } else {
        state.hostNameIdRelations[action.payload['name']] = action.payload['id']
      }
      // console.log(state.hostNameIdRelations)
      return {
        ...state,
        hostNameIdRelations: state.hostNameIdRelations
      }
    },
    handleNodeNameIdRelations(state, action) {
      if (Array.isArray(action.payload)) {  //  是数组时要一个个加为映射
        action.payload.forEach(v => {
          state.nodeNameIdRelations[v['name']] = v['id']
        })
      } else {
        state.nodeNameIdRelations[action.payload['name']] = action.payload['id']
      }
      return {
        ...state,
        nodeNameIdRelations: state.nodeNameIdRelations
      }
    },
    //
  },
  effects: {
    // *getTags ({ payload }, { put, call }) {  // 各监控项的tag
    //   const res = yield call(trendTags, {application: payload}) // 参数格式错误则请求可能不发起也不报错
    //   if (res.code === 0) {
    //     yield put({
    //       type: 'setTags',
    //       payload: {
    //         [payload+'Tags']: res.data
    //       }
    //     })
    //   } else {
    //     message.error(res.error || res.msg)
    //   }
    // },
    // *getApplications ({ payload }, { put, call, take }) {   //  监控项
    //   const res = yield call(getApplications)
    //   if (res.code === 0) {
    //     yield put({
    //       type: 'setApplications',
    //       payload: res.data
    //     })
    //     for (let i=0; i<res.data.length; i++) {
    //       // yield put({
    //       //   type: 'getTags',
    //       //   payload: res.data[i]
    //       // })
    //       // yield take('getTags/@@end')
    //       debugger
    //       yield call('getTags')
    //     }
    //   } else {
    //     message.error(res.error || res.msg)
    //   }
    // },

    *getApplications ({ payload }, { put, call, take }) {   //  监控项
      const res = yield call(getApplications)
      if (res.code === 0) {
        yield put({
          type: 'setApplications',
          payload: res.data
        })
        for (let i=0; i<res.data.length; i++) {
          yield put({
            type: 'getTags',
            payload: res.data[i]
          })
          yield take('getTags/@@end')
        }
      } else {
        message.error(res.error || res.msg)
      }
    },
    *getTags ({ payload }, { put, call }) {  // 各监控项的tag
      const res = yield call(trendTags, {application: payload}) // 参数格式错误则请求可能不发起也不报错
      if (res.code === 0) {
        yield put({
          type: 'setTags',
          payload: {
            [payload+'Tags']: res.data
          }
        })
      } else {
        message.error(res.error || res.msg)
      }
    },
    *getKeys ({ payload }, { put, call, select }) {
      const { keyword, applications, tags, advancedSearch, hostname, nodeType, hostNameIdRelations, nodeNameIdRelations } = yield select ((state) => { return state['monitor/trend']})
      // console.log(hostname, tags)
      let selectedTags = []
      applications.map(application => {
        const selectedTag = tags[application+'Tags'].filter((v)=>{ return v.checked === true }).map((k)=>{ return application + '.' + k.tag })
        selectedTags = selectedTags.concat(selectedTag)
      })
      selectedTags = selectedTags.join(',')
      const { page = 1 } = payload
      yield put({
        type: 'setCurrentPage',
        payload: page
      })
      const res = yield call(getKeys, advancedSearch ? {tag: selectedTags, page} : {keyword, page})
      if (res.code === 0) {
        const data = res.data.data
        const keys = []

        for (var i=0; i<data.length; i++) {
          let cards = null
          // console.log(data[i])
          if (hostname.length > 0 && data[i]['needs_host_info']) {
            // console.log(hostname, hostNameIdRelations, nodeNameIdRelations)
            let ids = []
            let params = {}
            if (nodeType === 'host') {
              hostname.map(v => {
                ids.push(hostNameIdRelations[v])
                // console.log(hostname, ids )
              })
              // console.log(hostname, ids )
              params = {'host_id': ids}
            } else {
              hostname.map(v => {
                ids.push(nodeNameIdRelations[v])
              })
              params = {'node_id': ids}
            }
            const response = yield call(getCards, {...params, 'key': data[i]['key']})
            if (response && response.code === 0) {
              cards = ['全部', ...response.data]
            } else {
              cards = null
              response && message.error(response.error || response.msg)
            }
          } else {
            cards = null
          }
          keys.push({'key': data[i]['key'], 'cards': cards})
          // console.log(keys)
        }
        // const keys = res.data.data.map((v)=>{
        //   return v.key
        // })

        yield put({
          type: 'getGraphKeys',
          payload: keys
        })
        yield put({
          type: 'getTotal',
          payload: res.data.total
        })
      } else {
        message.error(res.error || res.msg)
      }
    },

    *getBusinesses({ payload }, { put, call }){
      const res = yield call(getBusinesses, payload)
      if(res.code === 0){
        const businesses = res.data.map(v => {  // 只需要 {name, id}
          return {
            id: v.id,
            name: v.name
          }
        })
        yield put({
          type : 'setBusinesses',
          payload : businesses
        })
      }else{
        message.error(res.msg || res.error)
      }
    },

    *getApps({ payload }, { put, call }){
      const res = yield call(getApps, payload)
      if(res.code === 0){
        const apps = res.data.map(v => {  // 只需要 {name, id}
          return {
            id: v.id,
            name: v.name
          }
        })
        yield put({
          type : 'setApps',
          payload : apps
        })
      }else{
        message.error(res.msg || res.error)
      }
    },

    *getAllSelectContents({ payload }, { put, call, select }){
      const { relateType } = yield select((state) => {return state['monitor/trend']})
      const res = yield call(getBelongings, {'app_id' : payload})
      if(res.code === 0){
        const data = res.data
        yield put({
          type : 'setAllSelectContents',
          payload : {
            clusters: data.cluster,
            sets: data.set,
            instances: data.instance
          }
        })
        yield put({
          type : 'setSelectContents',
          payload : relateType === '2' ? data.instance : (relateType === '1' ? data.set : data.cluster)
        })
      }else{
        message.error(res.msg || res.error)
      }
    },

    *getComplexNodes({ payload }, { put, call, select }){
      const { relateType, relateId, hasQuery, selectedComplexNodes } = yield select((state) => {return state['monitor/trend']})
      const res = yield call(getNodes, { relate_type: Number(relateType), relate_id: relateId, paginate: 0 })
      if(res.code === 0){
        res.data = res.data.map(v => {
          return { id: v.id, name: v.node }
        })
        yield put({
          type : 'setComplexNodes',
          payload : res.data
        })
        yield put({
          type : 'handleNodeNameIdRelations',
          payload : res.data
        })

        if (hasQuery && selectedComplexNodes.length === 0) {  // 从集群管理跳过来，链接带query且没有指定节点
          const selectedComplexNodes = res.data.map(v => {
            return v.name
          })
          yield put({
            type : 'setSelectedComplexNodes',
            payload : selectedComplexNodes
          })
          yield put({
            type : 'setSelectedComplexNodesForTag',
            payload : selectedComplexNodes
          })
          yield put({
            type : 'setHostname',
            payload : selectedComplexNodes
          })
          // yield put({
          //   type : 'getKeys',
          // })
        }
      }else{
        message.error(res.msg || res.error)
      }
    },

    *getBelongs({ payload }, { put, call, select, take }){
      const { relate_type, relate_id } = payload
      const res = yield call(getBelongs, payload)
      if(res.code === 0){
        const data = res.data
        yield put({
          type : 'setNodeType',
          payload : 'node'
        })
        for (let i = 0; i < Object.keys(data).length; i++) {
          const v = Object.keys(data)[i]
          switch (v) {
            case 'business':
              yield put({
                type : 'setSelectedBusiness',
                payload : data[v]['name']
              })
              yield put({
                type : 'getApps',
                payload : data[v]['id']
              })
              break
            case 'application':
              yield put({
                type : 'setSelectedApp',
                payload : data[v]['name']
              })
              yield put({
                type : 'getAllSelectContents',
                payload : data[v]['id']
              })
              break
            case 'target':
              if ('type' in data[v]) {  //  目前是只有参数为node_id时才返回type，否则只返回target的name
                yield put({
                  type : 'setRelateType',
                  payload : data[v]['type']
                })
                yield put({
                  type : 'setRelateId',
                  payload : data[v]['id']
                })
                yield put({
                  type : 'getComplexNodes',
                })
                yield take('getComplexNodes/@@end')
              }
              yield put({
                type : 'setSelectedContent',
                payload : data[v]['name']
              })
              break
            case 'node':
              yield put({
                type : 'setSelectedComplexNodes',
                payload : [data[v]['name']]
              })
              yield put({
                type : 'setHostname',
                payload : [data[v]['name']]
              })
              yield put({
                type : 'handleNodeNameIdRelations',
                payload : {
                  'name': [data[v]['name']],
                  'id': relate_id
                }
              })
              break
          }
        }
      }else{
        message.error(res.msg || res.error)
      }
    },
    *getHosts ({  //  通过url的host_id获取对应主机
       payload
     }, {put, call}){
      const res = yield call(getHosts, payload)
      if(res.code === 0){
        yield put({
          type : 'setNodeType',
          payload : 'host'
        })
        yield put({
          type : 'handleHostNameIdRelations',
          payload : res.data
        })
        const data = res.data.map(v => v.name)
        yield put({
          type : 'setSelectedSimpleNodes',
          payload : data
        })
        yield put({
          type : 'setHostname',
          payload : data
        })
        // yield put({
        //   type : 'getKeys',
        // })
      }else{
        message.error(res.msg || res.error)
      }
    },
    *getDefaultHosts ({  // 进入页面默认选中第一个主机
                 payload
               }, {put, call}){
      const res = yield call(getHosts, payload)
      if(res.code === 0){
        yield put({
          type : 'setNodeType',
          payload : 'host'
        })
        yield put({
          type : 'handleHostNameIdRelations',
          payload : res.data
        })
        const selectedSimpleNodes = res.data[0]['name']
        // console.log([selectedSimpleNodes])
        yield put({
          type : 'setSelectedSimpleNodes',
          payload : [selectedSimpleNodes]
        })
        yield put({
          type : 'setHostname',
          payload : [selectedSimpleNodes]
        })
        // yield put({
        //   type : 'getKeys',
        // })

      }else{
        message.error(res.msg || res.error)
      }
    },
    *backToGraphs ({ payload }, { put, call }){
      yield put({
        type: 'setHasQuery',
        payload: false
      })
      yield put(routerRedux.replace({   //  从集群跳过来后更新选项，对应更新url
        pathname: '/graphs',
      }))
    },
    *handleClick ({   // 点击除全部外的其他tag
                     payload
                   }, {put, call, select}){
      const { tag, application } = payload
      const { selectAllTag } = yield select((state) => state['monitor/trend'])
      // console.log(selectAllTag[application])
      if (selectAllTag[application]) {  //  如果全部选中，点击某个tag时，先取消全部，在选中当前tag
        yield put({type:  `handleSelectAllTag`, payload: {application, selectAll: false}}) // 视图层对应那个全部反选
        yield put({type:  `clearTags`, payload: {application}})  //  model层对应application宣布反选
      }
      yield put({type:  `handleTags`, payload: {tag, application}})
    },
    *init ({ payload }, { put, call, select, take }) {
      yield put({type: 'getApplications'})
      yield take('getApplications/@@end')
      const user_id = cookie.get('uid')
      yield put({   //  初始业务待选项
        type : 'getBusinesses',
        payload : {
          user_id : user_id,
        }
      })
      const query = queryString.parse(location.search)
      if (Object.keys(query).length !== 0) {  // 从集群管理跳过来，url带query，则跳到高级搜索，且选中对应项
        const key = Object.keys(query)[0]  // 默认仅有一个query
        let showAdvance = true
        let relateType = ''
        let getNode = false
        switch (key) {
          case 'cluster_id':
            showAdvance = true
            relateType = 0,
              getNode = true
            break
          case 'set_id':
            showAdvance = true
            relateType = 1,
              getNode = true
            break
          case 'instance_id':
            showAdvance = true
            relateType = 2
            getNode = true
            break
          case 'node_id':
            showAdvance = true
            relateType = 3
            getNode = false
            break
          case 'host_id':
            showAdvance = false
            relateType = 0
            getNode = false
            break
        }
        yield put({
          type: 'setHasQuery',
          payload: true
        })
        const payload = {
          'relate_type': relateType,
          'relate_id': query[Object.keys(query)[0]]
        }
        if (getNode) {  // 三选一时再更新对应项
          yield put({
            type: 'setRelateType',
            payload: relateType
          })
          yield put({
            type: 'setRelateId',
            payload: query[Object.keys(query)[0]]
          })
          yield put({
            type: 'getComplexNodes'
          })
          yield take('getComplexNodes/@@end')
        }
        if (showAdvance) {  // 高级搜索时再获取父级关系
          yield put({
            type: 'getBelongs',
            payload: payload
          })
          yield take('getBelongs/@@end')
          yield put({type: 'showAdvancedSearch'})
        } else {  // 简易搜索时选中主机
          yield put({
            type: 'getHosts',
            payload: {
              'host_id': query[Object.keys(query)[0]]
            }
          })
          yield take('getHosts/@@end')
        }
      } else {
        yield put({
          type: 'setHasQuery',
          payload: false
        })
        yield put({
          type: 'hideAdvancedSearch'
        })
        yield put({
          type: 'getDefaultHosts',
          payload: {
            'paginate': 0
          }
        })
        yield take('getDefaultHosts/@@end')
      }
      yield put({type: 'getKeys', payload: {}})
    },
    *initAll ({ payload }, { put, call, select, take }) {
      yield put({type: 'init'})
      yield take('init/@@end')
      yield put({type: 'getKeys', payload: {}})
      yield take('getKeys/@@end')
    }
  },

  subscriptions: {
    setup ({ dispatch, history }) {
      dispatch({   // 让picker显示defaultValue
        type: 'reload',
        payload: {}
      })

      history.listen(location => {
        if (/graphs/.test(location.pathname)) {
          dispatch({
            type: 'init',
          })
        }
      })
    }
  },
}

