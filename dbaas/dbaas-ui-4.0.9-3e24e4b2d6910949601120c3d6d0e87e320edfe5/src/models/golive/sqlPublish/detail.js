import { getSqlHistory } from 'services/sqlPublish'
import {message} from 'antd'
import { Cache } from 'utils'
import pathToRegexp from 'path-to-regexp'
import { routerRedux } from 'dva/router'

export default {
  namespace: 'golive/sqlPublish/detail',
  state: {
    sqlID: '',
    sqlHistory: [],
    total: 0,
    currentPage: 1
  },
  reducers: {
    handleSqlID (state, action) {
      return {
        ...state,
        sqlID: action.payload
      }
    },
    handleSqlHistory (state, action) {
      return {
        ...state,
        sqlHistory: action.payload
      }
    },
    updateCurrentPage (state, action) {
      return {
        ...state,
        currentPage: action.payload,
      }
    },
    getTotal (state, action) {
      return {
        ...state,
        total: action.payload,
      }
    },
  },
  effects: {
    *getSqlHistory ({
       payload
     }, { call, put }) {
      const { id, page = 1 } = payload
      yield put({
        type: 'updateCurrentPage',
        payload: page
      })
      const res = yield call(getSqlHistory, {id, page})
      if (res.code === 0) {
        yield put({
          type: 'handleSqlHistory',
          payload: res.data.data
        })
        yield put({
          type: 'getTotal',
          payload: res.data.total
        })
      } else {
        message.error(res.error || res.msg)
        yield put(routerRedux.push({
          pathname: '/sql-publish',
        }))
      }
    },
  },
  subscriptions: {
    setup ({dispatch, history}) {
      history.listen(({pathname}) => {
        if (/sql-publish(\/)(\d+)(\/)detail/.test(pathname)) {  // 编辑页获取对应id
          const path = pathToRegexp('/sql-publish/:id(\\d+)/detail').exec(pathname)
          dispatch({
            type: 'handleSqlID',
            payload: path[1]
          })
          dispatch({
            type: 'getSqlHistory',
            payload: {
              id: path[1],
              page: 1
            }
          })
        }
      })
    }
  }
}
