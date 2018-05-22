/**
 * Created by zhangmm on 2017/8/19.
 */
import { addRole, getPermissions } from 'services/cmdb'
import { routerRedux } from 'dva/router'
import { message } from 'antd'

export default {
  namespace:'addRole',
  state:{
    permissions: [],
    recommit:false//防重复提交
  },
  reducers:{
    handlePermissions:(state , action) => {
      return{
        ...state,
        ...action.payload
      }
    },
    handleRecommit (state , action) {
      return {
        ...state,
        recommit:action.payload.recommit
      }
    },
  },
  effects:{
    *addRole({payload} , {call,put}){
      let res = yield call(addRole , payload)
      if(res.code === 0){
        yield put({type:'handleRecommit',payload:{recommit:false}})
        yield put(routerRedux.push({
          pathname: '/cmdb/role',
        }))
        message.success("角色新增成功")
      }else{
        yield put({type:'handleRecommit',payload:{recommit:false}})
        message.error(res.msg)
      }
    },
    *getPermissions({payload} , {call , put}){
      let res = yield call(getPermissions , payload)
      if(res.code === 0){
        yield put({
          type: 'handlePermissions',
          payload: {
            permissions: res.data
          }
        })
      }else{
        message.error(res.msg)
      }
    }
  },
  subscriptions:{
  }
}
