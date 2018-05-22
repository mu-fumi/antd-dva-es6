import { getUsers, sqlDetail, closeSql } from 'services/sqlPublish'
import {message} from 'antd'
import { routerRedux } from 'dva/router'
import { constant } from 'utils'

const { SQL_PUBLISH_MEANING_STATUS } = constant

export default {
  namespace:'golive/sqlPublish',
  state:{
    reload:(+ new Date()),
    filter:{
      keywords: '',
      created_at:'',
      end_at: '',
      user_id: '',
      status: ''
    },
    pickerDefaultValue: [], // picker的defaultValue，便于跳转别的页面然后从别的页面返回本页时保留筛选条件
    users : {"全部" : ''},
    currentPage: 1
  },
  reducers:{
    handleKeywords(state, action){
      return {
        ...state,
        filter: {
          ...state.filter,
          keywords: action.payload
        }
      }
    },
    handleReload (state) {
      return {
        ...state,
        reload: (+ new Date()),
      }
    },
    handleFilter (state, action) {
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload
        }
      }
    },
    handlePickerDefaultValue (state, action) {
      return {
        ...state,
        pickerDefaultValue: action.payload
      }
    },
    resetFilter(state){
      return {
        ...state,
        filter:{
          keywords: '',
          created_at:'',
          end_at: '',
          user_id: '',
          status: ''
        },
      }
    },
    setUsers(state, action){
      let users = {"全部" : ''}
      action.payload.forEach((item, key) => {
        users[item.user_name] = item.id
      })
      return {
        ...state,
        users : users
      }
    },
    setCurrentPage (state, action) {
      return {
        ...state,
        currentPage: action.payload
      }
    },
  },
  effects:{
    *getUsers({
        payload
      }, { put, call }){
      const res = yield call(getUsers)
      if(res.code === 0){
        yield put({
          type : 'setUsers',
          payload : res.data
        })
      }else{
        message.error(res.error || res.msg)
      }
    },
    *toEdit({payload}, {put, call}) {  //  列表页跳转编辑页
      const id = payload
      const res = yield call(sqlDetail, {id})
      if (res.code === 0) {
        let step = null
        const status = res.data.status
        if (status === SQL_PUBLISH_MEANING_STATUS['UPLOAD_SUCCEED']) {
          step = 1
        } else if (
          // status === SQL_PUBLISH_MEANING_STATUS['PUBLISH_FAILED'] ||
        status === SQL_PUBLISH_MEANING_STATUS['PUBLISH_SUCCEED'] ||
        status === SQL_PUBLISH_MEANING_STATUS['PUBLISHING'] ||
        // status === SQL_PUBLISH_MEANING_STATUS['ROLLBACK_SUCCEED'] ||
        status === SQL_PUBLISH_MEANING_STATUS['IN_ROLLBACK']
        // ||
        // status === SQL_PUBLISH_MEANING_STATUS['ROLLBACK_FAILED']
        ) {
          step = 2
        }
        yield put(routerRedux.push({
          pathname: `sql-publish/${id}/${step}`,
        }))
      } else {
        message.error(res.error || res.msg)
      }
    },
    *closeSql({payload}, {put, call}) {
      yield put({
        type: 'handlePageLoading',
        payload: true
      })
      const {sqlID} = payload
      const res = yield call(closeSql, {id: sqlID})
      yield put({
        type: 'handlePageLoading',
        payload: false
      })
      if (res && res.code === 0) {
        message.success('此发布已关闭！')
      } else {
        res && message.error(res.error || res.msg)
      }
    },
  },
  subscriptions:{
    setup({ dispatch, history }){
      history.listen(({ pathname }) => {
        let fullPath = pathname
        if (/^(\/sql-publish)$/.test(fullPath)) {
          dispatch({type: 'getUsers'})
        }
      })
    }
  }
}
