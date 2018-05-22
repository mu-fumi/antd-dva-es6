/**
 * Created by zhangmm on 2017/8/28.
 */
import { editUser, getRoles, getUser } from 'services/cmdb'
import { routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'editUser',
  state:{
      user_name: '',
      email: '',
      nick_name: '',
      password: '',
      role_id: '',
      active: '',
      roles:[],
      selectedPermissions: '',
      visible: false,
      recommit:false//防重复提交
  },
  reducers:{
    handleUser (state, action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleReset (state) {
      return {
        ...state,
          user_name: '',
          email: '',
          nick_name: '',
          password: '',
          role_id: '',
          active: '',
          roles:[],
          selectedPermissions: '',
          recommit:false//防重复提交
        }
    },
    handleRoles:(state, action) => {
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
    *editUser({payload , id} , {call,put}){
      let res = yield call(editUser , payload , id)
      if(res.code === 0){
        yield put({type:'handleRecommit',payload:{recommit:false}})
        yield put(routerRedux.push({
          pathname: '/cmdb/user',
        }))
        message.success("用户修改成功")
      }else{
        yield put({type:'handleRecommit',payload:{recommit:false}})
        message.error(res.msg)
      }
    },
    *getUser({payload} , {call , put}){
      let res = yield call(getUser , payload)
      if(res.code === 0){
        yield put({
          type:'handleUser',
          payload:{
            user_name: res.data.user_name,
            email: res.data.email,
            nick_name: res.data.nick_name,
            password: res.data.password,
            role_id: res.data.role_id,
            active: res.data.active,
            selectedPermissions: (res.data['sql_permissions'] || {})['permissions']
          }
        })
      }else{
        yield put(routerRedux.push('/cmdb/user'))
        message.error(res.error || res.msg)
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
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/cmdb(\/)user(\/)edit(\/)(\d+)$/.test(pathname)) {
          const path = pathToRegexp('/cmdb/user/edit/:id(\\d+)').exec(pathname)
          const id = path[1]
          dispatch({
            type : `getUser`,
            payload: {
              id: id
            }
          })
          dispatch({
            type : `getRoles`,
            payload:{
              paging:0
            }
          })
        }})
    }
  }
}
