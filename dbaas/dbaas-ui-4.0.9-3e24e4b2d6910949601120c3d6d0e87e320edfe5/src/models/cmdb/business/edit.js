/**
 * Created by zhangmm on 2017/9/2.
 */
import { editBusiness, getBusiness, getUsers } from 'services/cmdb'
//import { Link , browserHistory } from 'dva/router'
import { routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'editBusiness',
  state:{
    name: '',
    desc: '',
    user_id:'',
    users:[],
    level:'',
    recommit:false//防重复提交
  },
  reducers:{
    handleBusiness (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleReset (state) {
      return {
        ...state,
        name: '',
        desc: '',
        user_id:'',
        users:[],
        level:'',
        recommit:false//防重复提交
      }
    },
    handleUsers (state , action) {
      return {
        ...state,
        users:action.payload.users
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
    *editBusiness({payload , id} , {call,put}){
      let res = yield call(editBusiness , payload , id)
      if(res.code === 0){
        yield put({type:'handleRecommit',payload:{recommit:false}})
        yield put(routerRedux.push({
          pathname: '/cmdb/business',
        }))
        message.success("业务修改成功")
      }else{
        yield put({type:'handleRecommit',payload:{recommit:false}})
        message.error(res.msg)
      }
    },
    *getBusiness({payload} , {call , put}){
      let res = yield call(getBusiness , payload )
      if(res.code === 0){
        yield put({
          type:'handleBusiness',
          payload:{
            name:res.data.name,
            desc:res.data.desc,
            user_id:res.data.user_id,
          }
        })
      }else{
        yield put(routerRedux.push('/cmdb/business'))
        message.error(res.msg)
      }
    },
    *getUsers({payload} , {call,put}){
      let res = yield call(getUsers , payload)
      if(res.code === 0){
        yield put({
          type:"handleUsers",
          payload:{
            users:res.data
          }
        })
      }else{
        message.error(res.msg)
      }
    },
  },
  subscriptions:{
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/cmdb(\/)business(\/)(\d+)(\/)edit$/.test(pathname)) {
          const path = pathToRegexp('/cmdb/business/:id(\\d+)/edit').exec(pathname)
          const id = path[1]
          dispatch({
            type : `getBusiness`,
            payload : {id: id}
          })
          dispatch({
            type : `getUsers`
          })
        }})
    }
  }
}
