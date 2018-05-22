/**
 * Created by zhangmm on 2017/9/1.
 */
import {  } from 'services/cmdb'
import { Link } from 'dva/router'
import queryString from 'query-string'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'application',
  state:{
    placeholder : '名称、负责人、业务',
    filter : {
      keyword : '',
      name:''
    },
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
        filter:{
          ...state.filter,
          ...action.payload
        }
      }
    },
    handleKeyword (state , action) {
      return {
        ...state,
        filter:{
          ...state.filter,
          ...action.payload
        }
      }
    },
    resetFilter(state) {
      return {
        ...state,
        filter:{
          keyword : '',
          name:''
        }
      }
    },
  },
  effects:{
  },
  subscriptions:{
    setup ({ dispatch, history }) {
      history.listen(({pathname,search}) => {
        const allPath = pathname + search
        if (/cmdb(\/)app/.test(allPath)) {
          const query = queryString.parse(search)
          dispatch({
            type : `handleFilter`,
            payload : {
              ...query
            }
          })
        }})
    }
  }
}
