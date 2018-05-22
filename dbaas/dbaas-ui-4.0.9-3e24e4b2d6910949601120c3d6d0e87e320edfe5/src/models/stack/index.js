/**
 * Created by wengyian on 2017/7/5.
 */

import { getComponentsSummary,  } from 'services/stack'
import { Modal, message } from 'antd'

export default {
  namespace : 'stack',
  state : {
    clusterInfo : {},
  },
  reducers : {
    setClusterInfo(state, action){
      return {
        ...state,
        clusterInfo : action.payload
      }
    },
  },
  effects : {
    *getClusterInfo({
      payload
    }, { put, call }){
      const res = yield call(getComponentsSummary)
      // console.log('res.data===>', res.data)
      if(res.code === 0){
        yield put({
          type : 'setClusterInfo',
          payload : res.data
        })
      }else{
        message.error(res.error || res.msg)
      }
    },
  },
  subscriptions : {
    setup({ dispatch, history }){
      dispatch({
        type : 'getClusterInfo'
      })
    }
  }
};
