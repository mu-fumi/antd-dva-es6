/**
 * Created by zhangmm on 2017/9/2.
 */
import {  } from 'services/cmdb'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'business',
  state:{
    placeholder : '根据名称、负责人搜索',
    keyword : '',
    reload:(+ new Date())
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
        ...action.payload
      }
    },
    handleKeyword (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    resetFilter(state) {
      return {
        ...state,
        keyword : ''
      }
    },
  },
  effects:{
  },
  subscriptions:{
  }
}
