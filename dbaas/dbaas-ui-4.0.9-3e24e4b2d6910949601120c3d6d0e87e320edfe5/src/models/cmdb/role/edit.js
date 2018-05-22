/**
 * Created by zhangmm on 2017/8/21.
 */
import { editRole, getRole, getPermissions } from 'services/cmdb'
import { routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'editRole',
  state:{
    name: '',
    description: '',
    permissions: [],
    initPermissions: undefined,
    recommit:false//防重复提交
  },
  reducers:{
    handleRole (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleReset (state) {
      return {
        ...state,
        name: '',
        description: '',
        permissions: [],
        initPermissions: undefined,
        recommit:false//防重复提交
      }
    },
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
    *editRole({payload , id} , {call,put}){
      let res = yield call(editRole , payload , id)
      if(res.code === 0){
        yield put({type:'handleRecommit',payload:{recommit:false}})
        yield put(routerRedux.push({
          pathname: '/cmdb/role',
        }))
        message.success("角色修改成功")
      }else{
        yield put({type:'handleRecommit',payload:{recommit:false}})
        message.error(res.msg)
      }
    },
    *getRole({payload , id} , {call , put}){
      let res = yield call(getRole , payload )
      if(res.code === 0){
        yield put({
          type:'handleRole',
          payload:{
            name:res.data.name,
            description:res.data.description,
            initPermissions:(res.data.permissions && res.data.permissions.length > 0) ?
              res.data.permissions.map((data) =>{
              return data.display_name + ''
            }) : undefined
          }
        })
      }else{
        yield put(routerRedux.push('/cmdb/role'))
        message.error(res.msg)
      }
    },
    //修改的时候有initPermissions和permissions
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
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/cmdb(\/)role(\/)edit(\/)(\d+)$/.test(pathname)) {
          const path = pathToRegexp('/cmdb/role/edit/:id(\\d+)').exec(pathname)
          const id = path[1]
          dispatch({
            type : `getPermissions`,
            payload : { paging:0}
          })
          dispatch({
            type : `getRole`,
            payload : {id: id}
          })
        }})
    }
  }
}
