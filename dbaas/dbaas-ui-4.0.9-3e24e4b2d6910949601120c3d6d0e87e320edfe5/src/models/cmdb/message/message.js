/**
 * Created by zhangmm on 2017/9/7.
 */
import { read } from 'services/message'
import { message } from 'antd'

export default {
  namespace:'message',
  state:{
    placeholder : '根据关键词搜索消息',
    keyword : '',
    reload:(+ new Date())
  },
  reducers:{
    handleReload(state) {
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
    resetFilter(state) {
      return {
        ...state,
        keyword : ''
      }
    },
  },
  effects:{
    *read({payload} , {call , put}){
      let res = yield call(read , payload)
      if(res.code === 0){
        message.success(`已标记${payload.ids.length}条消息为已读`)
        yield put({type:"handleReload"})
      }else{
        message.error(res.msg)
      }
    }
  },
  subscriptions:{
  }
}
