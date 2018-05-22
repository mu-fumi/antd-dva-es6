/**
 * Created by zhangmm on 2017/8/28.
 */
import { addUser , getRoles } from 'services/cmdb'
import { routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'addUser',
  state:{
    roles: [],
    selectedPermissions: '',
    visible: false,
    recommit:false//防重复提交
  },
  reducers:{
    handleRoles:(state , action) => {
      return{
        ...state,
        ...action.payload
      }
    },
    handleSelectedPermissions (state, action) {
      return {
        ...state,
        selectedPermissions: action.payload
      }
    },
    handleModalVisible (state, action) {
      return {
        ...state,
        visible: action.payload
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
    *addUser({payload} , {call,put}){
      let res = yield call(addUser , payload)
      if(res.code === 0){
        yield put({type:'handleRecommit',payload:{recommit:false}})
        yield put(routerRedux.push({
          pathname: '/cmdb/user',
        }))
        message.success("用户新增成功")
      }else{
        yield put({type:'handleRecommit',payload:{recommit:false}})
        message.error(res.msg)
      }
    },
    *getRoles({payload} , {call , put}){
      let res = yield call(getRoles , payload)
      if(res.code === 0){
        yield put({
          type: 'handleRoles',
          payload: {
            roles: res.data
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
