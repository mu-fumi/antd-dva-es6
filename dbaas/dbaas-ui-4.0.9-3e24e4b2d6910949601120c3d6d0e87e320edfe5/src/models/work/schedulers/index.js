/**
 * Created by wengyian on 2017/6/26.
 */


import { getUsers, deleteSchedule, changeScheduleStatus } from 'services/schedulers'
import { Modal, message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace: 'work/schedulers',
  state: {
    reload : 0,
    filter:{
      keywords: '',
      status:'',
      editor: '',
      edit_begin_time: '',
      edit_end_time: '',
    },
    users : {"全部" : ''},
  },
  reducers: {

    handleReload(state, action){
      return {
        ...state,
        reload : (+ new Date())
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

    handleFilter(state, action){
      return {
        ...state,
        filter : {
          ...state.filter,
          ...action.payload
        }
      }
    },

    resetFilter(state, action){
      return {
        ...state,
        filter:{
          keywords: '',
          status:'',
          editor: '',
          edit_begin_time: '',
          edit_end_time: '',
        },
      }
    }
  },
  effects: {
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

    *deleteSchedule({
      payload
    }, { put, call}){
      const res = yield call(deleteSchedule, payload)
      if(res.code === 0){
        yield put({
          type : 'handleReload',
        })
      }else{
        message.error(res.error || res.msg)
      }
    },

    *changeScheduleStatus({
      payload
    }, { put, call}){
      const res = yield call(changeScheduleStatus, payload)
      if(res.code === 0){
        yield put({
          type : 'handleReload',
        })
      }else{
        message.error(res.error || res.msg)
      }
    }
  },
  subscriptions: {
    setup({ dispatch, history }){
      dispatch({ type : 'getUsers'})
      history.listen(({pathname}) => {
        // const match = pathToRegexp('schedulers').exec(pathname)
        // if(match){
        //   dispatch({
        //     type : 'resetFilter'
        //   })
        // }
      })
    }
  },
};
