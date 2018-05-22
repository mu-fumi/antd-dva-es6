/**
 * Created by zhangmm on 2018/2/1.
 */
import { editVersion, getVersionInfo } from 'services/package'
//import { Link , browserHistory } from 'dva/router'
import { routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'editVersion',
  state:{
    version_name:'',
    package_name:'',
    demo:'',
    recommit:false//防重复提交
  },
  reducers:{
    handleVersion (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleReset (state) {
      return {
        ...state,
        version_name:'',
        package_name:'',
        demo:'',
        recommit:false//防重复提交
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
    *editVersion({payload} , {call,put}){
      let res = yield call(editVersion , payload)
      if(res.code === 0){
        yield put({type:'handleRecommit',payload:{recommit:false}})
        yield put(routerRedux.push({
          pathname: `/packages/${payload.pkgid}`,
        }))
        message.success("程序包版本修改成功")
      }else{
        yield put({type:'handleRecommit',payload:{recommit:false}})
        message.error(res.msg)
      }
    },
    *getVersionInfo({payload} , {call , put}){
      let res = yield call(getVersionInfo , payload )
      if(res.code === 0){
        yield put({
          type:'handleVersion',
          payload:res.data
        })
      }else{
        yield put(routerRedux.push(`/packages/${payload.pkgid}`))
        message.error(res.msg)
      }
    },
  },
  subscriptions:{
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/packages(\/)(\d+)(\/)(\d+)(\/)editVersion$/.test(pathname)) {
          const path = pathToRegexp('/packages/:pkgid(\\d+)/:id(\\d+)/editVersion').exec(pathname)
          const pkgid = path[1]
          const id = path[2]
          dispatch({
            type : `getVersionInfo`,
            payload : {
              id: id,
              pkgid:pkgid
            }
          })
        }})
    }
  }
}
