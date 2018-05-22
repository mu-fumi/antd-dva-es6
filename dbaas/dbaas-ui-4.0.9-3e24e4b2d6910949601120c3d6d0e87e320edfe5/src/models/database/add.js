/**
 * Created by zhangmm on 2017/10/31.
 */
import { getCharset, getAccounts, addDatabase } from 'services/database'
import { routerRedux } from 'dva/router'
import { message } from 'antd'

export default {
  namespace:'addDb',
  state:{
    charsets:[],
    accounts:[]
  },
  reducers:{
    handleCharset(state,action){
      return {
        ...state,
        ...action.payload
      }
    },
    handleAccounts(state,action){
      return {
        ...state,
        ...action.payload
      }
    }
  },
  effects:{
    *getCharset({payload} , {call, put}){
      let res = yield call(getCharset , payload)
      if(res.code === 0){
        yield put({
          type:"handleCharset",
          payload:{
            charsets:res.data
          }
        })
      }else{
        message.error(res.msg)
      }
    },
    *getAccounts({payload} , {call, put}){
      let res = yield call(getAccounts , payload)
      if(res.code === 0){
        yield put({
          type:"handlegetAccounts",
          payload:{
            accounts:res.data
          }
        })
      }else{
        message.error(res.msg)
      }
    },
    *addDatabase({payload} , {call, put}){
      let res = yield call(addDatabase , payload)
      if(res.code === 0){
        yield put(routerRedux.push({
          pathname: '/databases',
        }))
      }else{
        message.error(res.msg)
      }
    },
  },
  subscriptions:{
  }
}
