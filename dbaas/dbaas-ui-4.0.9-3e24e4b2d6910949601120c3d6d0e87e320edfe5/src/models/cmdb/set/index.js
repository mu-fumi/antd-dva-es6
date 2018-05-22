/**
 * Created by wengyian on 2017/12/5.
 */
import {  getBusiness, getApp, getNodeStatus, updateStatus } from 'services/cmdbCluster'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'
import _ from 'lodash'
import { constant } from 'utils'
const { RELATE_TYPE } = constant

/********  20171220 获取url 参数筛选*********/
import queryString from 'query-string'

export default {
  namespace:'set',
  state:{
    placeholder : '根据关键词搜索集群',
    filter : {
      keyword : '',
      business_id : '',
      app_id : '',
      status : ''
    },
    reload:(+ new Date()),
    businessOptions : [],
    // appOptions : {},
    selectedIds : [],
    belongsOptions : [],
    defaultBelongs : [],
  },
  reducers:{
    handleReload:(state) => {
      return {
        ...state,
        reload:(+ new Date())
      }
    },
    handleFilter (state , action) {
      return {
        ...state,
        filter : {
          ...state.filter,
          ...action.payload
        }
      }
    },

    resetFilter(state, aciton){
      return {
        ...state,
        filter : {
          keyword : '',
          business_id : '',
          app_id : '',
          status : '',
        }
      }
    },

    setBusinessOptions(state, action){
      const params = action.payload
      const businesses = params.map(v => {
        return {
          label : v.name,
          value : v.id,
          isLeaf : false
        }
      })
      return {
        ...state,
        businessOptions : businesses,
        belongsOptions : businesses
      }
    },

    setAppOptions(state, action){
      // 只需要 {name, id}
      const params = action.payload
      const app = {}
      params.forEach(v => {
        app[v.name] = v.id
      })
      return {
        ...state,
        appOptions : app
      }
    },

    setNodeStatus(state, action){

    },

    setSelectedIds(state, action){
      const { rows, bool, radio } = action.payload
      let { selectedIds } = state
      let oldSelectedIds = [...selectedIds]
      switch (radio){
        case true :
          if(bool){
            oldSelectedIds.push(rows.id)
          }else{
            oldSelectedIds = oldSelectedIds.filter(v => v != rows.id)
          }
          break
        case false :
          if(bool){
            rows.forEach( v => {
              oldSelectedIds.push(v.id)
            })
          }else{
            rows.forEach( v => {
              oldSelectedIds = oldSelectedIds.filter( val => v.id != val)
            })
          }
          break
      }
      return {
        ...state,
        selectedIds : oldSelectedIds
      }
    },


    /********  20171220 获取url 参数筛选*********/
    // 清空 filter 中url 带过来的参数
    clearQuery(state, action){
      const allowFilter = ['keyword', 'business_id', 'app_id', 'status']
      const query = action.payload
      let { filter } = state
      Object.keys(query).forEach(key => {
        if(!allowFilter.includes(key)){
          delete filter[key]
        }
      })
      return {
        ...state,
        filter : {...filter}
      }
    },


    /*********  20180112 初始化 所属筛选栏 ***********/
    setBelongsOptions(state, action){
      let { businessOptions } = state

      businessOptions = _.cloneDeep(businessOptions)

      const { data, id} = action.payload
      const app = data.map( v => {
        return {
          label : v.name,
          value : v.id,
          isLeaf : true
        }
      })
      if(app.length === 0){
        app.push({
          label : '暂无数据',
          value : '暂无数据',
          isLeaf : true
        })
      }
      if(businessOptions.length){
        businessOptions.forEach( v => {
          if(v.value === Number(id)){
            v.children = app
          }
        })
      }
      return {
        ...state,
        belongsOptions : businessOptions
      }
    },

    setDefaultBelongs(state, action){
      const { business_id, app_id} = action.payload
      let belongs = []
      if(business_id){
        belongs.push(Number(business_id))
        app_id && belongs.push(Number(app_id))
      }
      return {
        ...state,
        defaultBelongs : belongs
      }
    },

    resetDefaultBelongs(state, action){
      return {
        ...state,
        defaultBelongs : []
      }
    }

  },
  effects:{

    *getBusiness({
                   payload
                 }, { call, put }){
      const res = yield call(getBusiness, payload)
      const {business_id, app_id} = payload
      if(res.code === 0){
        yield put({
          type : 'setBusinessOptions',
          payload : res.data
        })
        if(business_id && app_id){
          yield put({
            type : 'getApp',
            payload : {
              business_id
            }
          })
        }
      }else{
        message.error(res.msg || res.error)
      }
    },

    *getApp({
              payload
            }, { call, put }){
      const res = yield call(getApp, payload)
      if(res.code === 0){
        yield put({
          type : 'setBelongsOptions',
          payload : {
            data : res.data,
            id : payload.business_id
          }
        })
      }else{
        message.error(res.msg || res.error)
      }
    },

    *getNodeStatus({
                     payload
                   }, { call, put }){
      const res = yield call(getNodeStatus, payload)
      if(res.code === 0){
        yield put({
          type : 'setNodeStatus',
          payload : res.data
        })
      }else{
        message.error(res.msg || res.error)
      }
    },

    *updateStatus({
                    payload
                  }, { call, put}){
      const ids = [payload]
      const params = {
        type : RELATE_TYPE['set'], //instance : 2
        ids : ids,
        summary : false
      }
      const res = yield call(updateStatus, params)
      if(res.code === 0){
        yield put({
          type : 'handleReload'
        })
        message.success('更新任务已提交后台处理，稍后刷新查看')
      }else{
        message.error(res.msg || res.error)
      }
    }
  },
  subscriptions:{
    setup({ dispatch, history }){
      history.listen(({pathname, search}) => {
        if(history.action === 'REPLACE'){
          return
        }
        const match = pathToRegexp('/cmdb/instance-group').exec(pathname)
        if(match){
          /********  20171220 获取url 参数筛选*********/
          const query = queryString.parse(search)
          const {...filter} = query

          const { business_id, app_id } = filter
          if(app_id){
            if(!business_id){
              filter.app_id = ''
            }
          }
          dispatch({
            type : 'handleFilter',
            payload : filter
          })
          dispatch({
            type : 'getBusiness',
            payload : {
              business_id,
              app_id
            }
          })

          /***** 20180112 所属筛选默认值填充 *****/
          if(business_id || app_id){
            dispatch({
              type : 'setDefaultBelongs',
              payload : {
                business_id,
                app_id
              }
            })
          }
        }
      })
    }
  }
}
