/**
 * Created by zhangmm on 2017/8/28.
 */
import { Link , browserHistory } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'permission',
  state:{
    placeholder : '根据权限、等级搜索',
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
