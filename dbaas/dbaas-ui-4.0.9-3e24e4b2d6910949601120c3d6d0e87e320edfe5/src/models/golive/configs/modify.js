/**
 * Created by zhangmm on 2017/9/29.
 */
import { getStackOption, getConfigure, changeConfigure, getNodeConfigs, changeNodeConfigure } from 'services/configs'
import { routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'modify',
  state:{
    current: 0,
    filter:{
      paginate:1,
      keyword : '',
      stack_id:'',
    },
    stackOption:{},
    selectedRowKeys:[],
    configure:{},
    nodeConfigure:{},
    params:[],
    cluster:[],
    loading: true,
    spin:true,
    configuration:{},
    nodeId:'',
    nodeName:'',
    status:[]
  },
  reducers:{
    handleReset (state ) {
      return{
        ...state,
        current: 0,
        filter:{
          paginate:1,
          keyword : '',
          stack_id:'',
        },
        stackOption:{},
        selectedRowKeys:[],
        configure:{},
        nodeConfigure:{},
        params:[],
        cluster:[],
        loading: true,
        spin:true,
        configuration:{},
        nodeId:'',
        nodeName:'',
        status:[]
      }
    },
    handleFilter (state , action) {
      return {
        ...state,
        filter:{
          ...state.filter,
          ...action.payload
        }
      }
    },
    handleStackId (state , action) {
      return {
        ...state,
        filter:{
          ...state.filter,
          ...action.payload
        }
      }
    },
    handleCurrent:(state,action) => {
      return{
        ...state,
        ...action.payload
      }
    },
    handleCurrentPlus:(state) => {
      return{
        ...state,
        current:state.current + 1
      }
    },
    handleCurrentMinus:(state) => {
      return{
        ...state,
        current:state.current - 1
      }
    },
    handleSelectedRowKeys:(state , action) => {
      return{
        ...state,
        selectedRowKeys:action.payload.selectedRowKeys
      }
    },
    handleStackOption:(state , action) => {
      return{
        ...state,
        ...action.payload
      }
    },
    handleConfigure:(state , action) => {
      return{
        ...state,
        ...action.payload
      }
    },
    handleNodeConfigure:(state , action) => {
      return{
        ...state,
        ...action.payload
      }
    },
    handleParams:(state , action) => {
      return{
        ...state,
        ...action.payload
      }
    },
    handleSelectedCluster:(state , action) => {
      return{
        ...state,
        ...action.payload
      }
    },
    handleLoading:(state , action) => {
      return{
        ...state,
        ...action.payload
      }
    },
    handleSpin:(state , action) => {
      return{
        ...state,
        ...action.payload
      }
    },
    //第三步上送的参数 保存起来
    handleConfiguration:(state , action) => {
      return{
        ...state,
        ...action.payload
      }
    },
    handleNode:(state , action) => {
      return{
        ...state,
        nodeId:action.payload.nodeId,
        nodeName:action.payload.nodeName,
      }
    },
    handleSelectedStatus:(state , action) => {
      return{
        ...state,
        ...action.payload
      }
    },
  },
  effects:{
    *getStackOption({payload}, { put, call, select }){
      let { stackOption } = yield select(
        (state) => ({...state['modify'] })
      )
      const res = yield call(getStackOption)
      if(res.code === 0){
        res.data.forEach((v) =>{
           stackOption[v.name] = v.id
        })
        stackOption = {
          "全部":'',
          ...stackOption
        }
        yield put({
          type : 'handleStackOption',
          payload : {
            stackOption:stackOption
          }
        })
      }else {
        message.error( res.error || res.msg )
      }
    },
    *getConfigure({payload}, { put, call }){
      const res = yield call(getConfigure,payload)
      if(res.code === 0){
        yield put({
          type : 'handleConfigure',
          payload : {
            configure:res.data
          }
        })
      }else {
        message.error( res.error || res.msg )
      }
    },
    *changeConfigure({payload}, { call, select, put }){
      let { configuration } = yield select(
        (state) => ({...state['modify'] })
      )
      const res = yield call(changeConfigure,configuration)
      if(res.code === 0){
        yield put(routerRedux.push({
          pathname: '/configs',
        }))
        message.success('配置变更成功')
      }else {
        message.error( res.error || res.msg )
      }
    },
    *changeNodeConfigure({payload}, { put, call, select }){
      let { configuration } = yield select(
        (state) => ({...state['modify'] })
      )
      const res = yield call(changeNodeConfigure,configuration,payload.id)
      if(res.code === 0){
        yield put(routerRedux.push({
          pathname: '/nodes',
        }))
        message.success('配置变更成功')
      }else {
        message.error( res.error || res.msg )
      }
    },
    *saveConfiguration({payload}, { put, call, select }){
      let { params, cluster, nodeName } = yield select(
        (state) => ({...state['modify'] })
      )
      yield put({
        type : 'handleConfiguration',
        payload:{
          configuration:payload.configuration
        }
      })
      let cluster_obj = {}
      cluster.map((v,k) =>{
        cluster_obj = {
          ...cluster_obj,
          ...v
        }
      })
      Object.keys(payload.configuration.alteration).map((v1,k1) =>{
        let list = []
        Object.keys(payload.configuration.alteration[v1]).map((v2,k2) =>{
          let after = payload.configuration.alteration[v1][v2]['after']
          let before = payload.configuration.alteration[v1][v2]['before']
          if( after !== before ){
            let obj = {}
            obj['id'] = k2
            obj['cluster'] = cluster_obj[v1] ? cluster_obj[v1] : nodeName
            obj['key'] = v2
            obj['after'] = after
            obj['before'] = before
            list.push(obj)
          }
        })
        list.forEach((v,k) =>{
          v['number'] = list.length
        })
        params = []
        params.push(...list)
      })

      yield put({
        type : 'handleParams',
        payload:{
          params:params
        }
      })
    },
    *getNodeConfigs({payload}, { put, call }){
      const res = yield call(getNodeConfigs,payload)
      if(res.code === 0){
        yield put({
          type : 'handleConfigure',
          payload : {
            configure:res.data
          }
        })
      }else {
        yield put(routerRedux.push({
          pathname: '/nodes',
        }))
        message.error( res.error || res.msg )
      }
    },
  },
  subscriptions:{
    setup ({ dispatch, history }) {
      history.listen(({pathname,search}) => {
        let allPath = pathname + search
        if (/\?node_id=/.test(allPath)) {
          const path = search.split('&')
          const id = path[0].split('=')[1]
          const name = path[1].split('=')[1]
          dispatch({
            type : 'handleCurrent',
            payload:{current:1}
          })
          dispatch({
            type : 'handleNode',
            payload:{nodeId:id,nodeName:name}
          })
/*          dispatch({
            type : 'getNodeConfigs',
            payload : {id: id}
          })*/
        }})
    }
  }
}
