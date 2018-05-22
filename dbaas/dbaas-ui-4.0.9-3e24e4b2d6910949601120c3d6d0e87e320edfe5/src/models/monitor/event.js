
import { updateReadData } from 'services/message'
import {message} from 'antd'
export default {
  namespace:'monitor/events',
  state:{
    reload:(+ new Date()),
  },
  reducers:{
    handleReload:(state)=>{
      return{
        ...state,
        reload:(+new Date())
      }
    },
  },
  effects:{
    *getRead({ payload }, { put, call }){

      console.log('updateReadDate===>', updateReadData)
      // const res = yield call(updateReadData, payload)
      // if (res.code === 0) {
      //   message.success(`已标记${res.data}条消息为已读`)
      //   //dispatch({ type: `message/list/handleReload` })
      //   yield put({
      //     type: 'handleReload'
      //   })
      // }
    }
  },
  subscriptions:{}
}
