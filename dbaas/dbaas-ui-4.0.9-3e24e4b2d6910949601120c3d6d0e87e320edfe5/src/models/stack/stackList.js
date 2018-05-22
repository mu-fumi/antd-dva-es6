/**
 * Created by wengyian on 2017/7/5.
 */

import { getStackService, deleteService, getStackTags, deleteStack } from 'services/stack'
import { Modal, message } from 'antd'
/********  20171220 获取url 参数筛选*********/
import queryString from 'query-string'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace : 'stack/stackList',
  state : {
    filter : {
      keyword : '',
      tag : '',
      paginate : 1,
    },
    stackReload : 0,
    serviceReload : 0,
    serviceVisible : false,
    serviceList : [],
    stackInfo : {
      id : '',
      name : ''
    },
    stackTags : []
  },
  reducers : {
    handleStackReload(state, action){
      return {
        ...state,
        stackReload : (+ new Date())
      }
    },

    handleServiceReload(state, action){
      return {
        ...state,
        serviceReload : (+ new Date())
      }
    },

    handleFilter(state, action){
      return {
        ...state,
        filter : {
          ...state.filter,
          ...action.payload
        }
      }
    },

    showServiceModal(state, action){
      return {
        ...state,
        serviceVisible: true
      }
    },

    hideServiceModal(state, action){
      return {
        ...state,
        serviceVisible : false
      }
    },

    setStackInfo(state, action){
      return {
        ...state,
        stackInfo : action.payload
      }
    },

    setStackTags(state, action){
      return {
        ...state,
        stackTags : action.payload
      }
    },

    /********  20171220 获取url 参数筛选*********/
    // 清空 filter 中url 带过来的参数
    clearQuery(state, action){
      const allowFilter = ['keyword', 'paginate', 'tag', ]
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


  },
  effects : {

    *deleteService({
      payload
    }, { put, call }){
      const res = yield call(deleteService, payload)
      if(res.code === 0){
        yield put({
          type : 'handleServiceReload'
        })
      }else {
        message.error( res.error || res.msg )
      }
    },

    *getStackTags({
      payload
    }, { put, call }){
      const res = yield call(getStackTags)
      if(res.code === 0){
        yield put({
          type : 'setStackTags',
          payload : res.data
        })
      }else {
        message.error( res.error || res.msg )
      }
    },

    *deleteStack({
      payload
    }, { put, call }){
      const res = yield call(deleteStack, payload)
      if(res.code === 0){
        yield put({
          type : 'handleStackReload'
        })
      }else{
        message.error( res.error || res.msg )
      }

    }
  },
  subscriptions : {
    setup({ dispatch, history }){
      history.listen(({pathname, search}) => {
        const match = pathToRegexp('/cmdb/component/stack-view').exec(pathname)
        if(match){
          /********  20171220 获取url 参数筛选*********/
          const query = queryString.parse(search)
          const {...filter} = query
          dispatch({
            type : 'handleFilter',
            payload : filter
          })
          dispatch({
            type : 'getStackTags'
          })
        }
      })
    }
  }
};
