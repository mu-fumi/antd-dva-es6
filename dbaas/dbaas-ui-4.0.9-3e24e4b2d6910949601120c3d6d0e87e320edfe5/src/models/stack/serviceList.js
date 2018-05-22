/**
 * Created by wengyian on 2017/7/20.
 */

import { deleteService } from 'services/stack'
import { message } from 'antd'
import { Link, routerRedux } from 'dva/router'
import pathToRegexp from 'path-to-regexp'
import _ from 'lodash'
import queryString from 'query-string'

export default {
  namespace : 'stack/serviceList',
  state : {
    filter : {
      keyword : '',
      type : '',
      paginate : 1
    },
    reload : 0,
  },
  reducers : {
    handleFilter(state, action){
      return {
        ...state,
        filter : {
          ...state.filter,
          ...action.payload
        }
      }
    },

    handleReload(state, action){
      return {
        ...state,
        reload : ( + new Date())
      }
    },

    resetFilter(state, action){
      return {
        ...state,
        filter : {
          keyword : '',
          type : '',
          paginate : 1
        }
      }
    },

    /********  20171220 获取url 参数筛选*********/
    // 清空 filter 中url 带过来的参数
    clearQuery(state, action){
      const allowFilter = ['keyword', 'paginate', 'type', ]
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
          type : 'handleReload'
        })
      }else{
        message.error( res.msg || res.error )
      }
    }
  },
  subscriptions : {
    setup({ dispatch, history }){
      history.listen(({pathname, search}) => {
        const match = pathToRegexp('/cmdb/component/serview-view').exec(pathname)
        if(match){
          /********  20171220 获取url 参数筛选*********/
          const query = queryString.parse(search)
          const {...filter} = query
          dispatch({
            type : 'handleFilter',
            payload : filter
          })
        }
      })
    }
  }
}
