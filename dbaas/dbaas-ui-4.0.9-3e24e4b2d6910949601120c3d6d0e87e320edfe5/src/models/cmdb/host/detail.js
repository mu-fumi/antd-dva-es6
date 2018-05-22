/**
 * Created by zhangmm on 2017/9/15.
 */
import { deleteHost, getHost, getHostBasic, getHostExtend } from 'services/cmdb'
import { routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'detail',
  state:{
    id:'',
    name:'',
    basic:{},
    extend:{}
  },
  reducers:{
    handleHost (state , action) {
      return {
        ...state,
        id:action.payload.id,
        name:action.payload.name,
        basic:action.payload.basic,
        extend:action.payload.extend
      }
    },
    handleHostBasic (state , action) {
      return {
        ...state,
        id:action.payload.id,
        name:action.payload.name,
        basic:action.payload.basic
      }
    },
    handleHostExtend (state , action) {
      return {
        ...state,
        extend:action.payload.extend
      }
    },
    handleReset (state) {
      return {
        ...state,
        basic:{},
        extend:{}
      }
    },
  },
  effects:{
    *deleteHost({payload} , {call , put}){
      let res = yield call(deleteHost , payload);
      if(res.code === 0){
        yield put(routerRedux.push({
          pathname: '/cmdb/host',
        }))
        message.success('主机删除成功')
      }else{
        message.error(res.msg)
      }
    },
    *getHost({payload} , {call , put}){
      let res = yield call(getHost , payload);
      if(res.code === 0){
        yield put({
          type:'handleHost',
          payload:{
            id:res.data.basic.id,
            name:res.data.basic.host_name,
            basic:res.data.basic,
            extend:res.data
          }
        })
        yield put({
          type : 'app/handlePageBtns',
          payload :
          {
            props: {
              id:payload.id,
              serviceExist:res.data.basic.serviceExist,
              status: res.data.basic.connect_status
            }
          }
        })
      }else{
        yield put(routerRedux.push('/cmdb/host'))
        message.error(res.msg)
      }
    },
    *getHostBasic({payload} , {call , put}){
      let res = yield call(getHostBasic , payload )
      if(res.code === 0){
        yield put({
          type:'handleHostBasic',
          payload:{
            id:res.data.id,
            name:res.data.host_name,
            basic:res.data
          }
        })
      }else{
        yield put(routerRedux.push('/cmdb/host'))
        message.error(res.msg)
      }
    },
    *getHostExtend({payload} , {call , put}){
      let res = yield call(getHostExtend , payload )
      if(res.code === 0){
        yield put({
          type:'handleHostExtend',
          payload:{
            extend:res.data
          }
        })
        yield put({
          type : 'app/handlePageBtns',
          payload : {props: {id:payload.id,serviceExist:res.data.service.length === 0 ? false : true}}
        })
      }else{
        yield put(routerRedux.push('/cmdb/host'))
        message.error(res.msg)
      }
    },
  },
  subscriptions:{
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/cmdb(\/)host(\/)(\d+)$/.test(pathname)) {
          const path = pathToRegexp('/cmdb/host/:id(\\d+)').exec(pathname)
          const id = path[1]
          dispatch({
               type : 'getHost',
               payload : {id:id}
          })
/*          dispatch({
            type:'getHostBasic',
            payload:{
              id:id,
            }
          })
          dispatch({
            type:'getHostExtend',
            payload:{
              id:id,
            }
          })*/
        }})
    }
  }
}
