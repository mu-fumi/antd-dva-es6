/**
 * Created by zhangmm on 2017/8/19.
 */
import { deleteRole } from 'services/cmdb'
import { message } from 'antd'

export default {
  namespace:'role',
  state:{
    placeholder : '根据角色名搜索',
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
    *deleteRole({payload} , {call , put}){
      let res = yield call(deleteRole , payload)
      if(res.code === 0){
        yield put({type:"handleReload"})
        message.success('角色删除成功')
      }else{
        message.error(res.msg)
      }
    }
  },
  subscriptions:{
  }
}
