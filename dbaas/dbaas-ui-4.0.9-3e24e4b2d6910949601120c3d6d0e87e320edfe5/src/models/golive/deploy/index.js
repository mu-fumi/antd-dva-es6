/**
 * Created by wengyian on 2017/8/15.
 */

import { getStack, getInstance, } from 'services/deploy'
import { message } from 'antd'

export default {
  namespace : 'deploy',
  state : {
    filter : {
      keyword : '',
      time : '',
      stack_id : '',
      // client_id : 1, //暂时默认为1
    },
    stackOptions : {"全部" : ''},
    reload : 0,
  },
  reducers : {
    initFilter(state, action){
      return {
        ...state,
        filter : {
          keyword: '',
          time : '',
          type : ''
        }
      }
    },


    handleFilter(state, action){
      return {
        ...state,
        filter : {
          ...state.filter,
          ...action.payload,
        }
      }
    },

    resetFilter(state, action){
      return {
        ...state,
        filter : {
          keyword : '',
          time : '',
          stack_id : '',
          // client_id : 1, //暂时默认为1
        }
      }
    },



    handleReload(state, action){
      return {
        ...state,
        reload : (+ new Date())
      }
    },

    setStackOptions(state, action){
      let stackOptions = {"全部" : ''}
      action.payload.forEach(item => {
        stackOptions[item.name] = item.id
      })
      return {
        ...state,
        stackOptions : stackOptions
      }
    },

  },
  effects : {
    *getStack({
      payload
     }, { put, call}){
      const res = yield call(getStack, {paginate : 0})
      if(res.code === 0){
        yield put({
          type : 'setStackOptions',
          payload : res.data
        })
      }else{
        message.error(res.error || res.msg)
      }
    }
  },
  subscriptions : {
    setup({dispatch, history}){
      dispatch({
        type : 'getStack'
      })
    }
  }

}
