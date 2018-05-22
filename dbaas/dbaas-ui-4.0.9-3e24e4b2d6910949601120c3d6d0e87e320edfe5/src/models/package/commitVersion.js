/**
 * Created by zhangmm on 2017/7/5.
 */
import { commit , changedList } from 'services/package'
import { routerRedux } from 'dva/router'
import pathToRegexp from 'path-to-regexp'
import { message } from 'antd'

export default {
  namespace:'package/commitVersion',
  state:{
    disabled: true,
    recommit:false,//防重复提交
    version:[],
    spinning:false
  },
  reducers:{
    handleDisabled:(state , action) => {
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
    handleVersion (state , action) {
      return {
        ...state,
        version:action.payload.version
      }
    },
    handleSpinning (state , action) {
      return {
        ...state,
        spinning:action.payload.spinning
      }
    },
  },
  effects:{
    *commitVersions({ payload },{call , put}){
      let res = yield call( commit, payload)
      if(res.code === 0){
        yield put({type:'handleRecommit',payload:{recommit:false}})
        yield put(routerRedux.push({
          pathname: `/packages/${payload.id}`,
        }))
        message.success("版本提交成功！")
      }else{
        yield put({type:'handleRecommit',payload:{recommit:false}})
        message.error(res.msg)
      }
    },
    *changedList({ payload },{call , put}){
      yield put({
        type:"handleSpinning",
        payload: {spinning:true}
      })
      let res = yield call( changedList, payload)
      if(res.code === 0){
        yield put({
          type:"handleVersion",
          payload: {
            version:res.data
          }
        })
        yield put({
          type:"handleDisabled",
          payload: {
            disabled:res.data.length === 0 ? true : false
          }
        })
      }else{
        yield put(routerRedux.push(`/packages/${payload.id}/tree`))
        message.error(res.msg)
      }
      yield put({
        type:"handleSpinning",
        payload: {spinning:false}
      })
    },
  },
  subscriptions:{
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/packages(\/)(\d+)(\/)commitVersion/.test(pathname)) {
          const path = pathToRegexp('/packages/:id(\\d+)/commitVersion').exec(pathname)
          const id = path[1]
          /*dispatch({
            type : `changedList`,
            payload : {
              id : id
            }
          })*/
        }})
    }
  }
}
