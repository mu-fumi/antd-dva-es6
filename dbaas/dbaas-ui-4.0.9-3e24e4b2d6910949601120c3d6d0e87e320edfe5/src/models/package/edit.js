/**
 * Created by zhangmm on 2017/7/4.
 */
import { getPackageInfo , editPackageInfo} from 'services/package'
import { routerRedux } from 'dva/router'
import { message } from 'antd'

export default {
  namespace:'package/edit',
  state:{
    package_name:'',
    location:'',
    memo:'',
    recommit:false//防重复提交
  },
  reducers:{
    handleEdit:(state , action)=>{
      return{
        ...state,
        ...action.payload
      }
    },
    handleReset (state) {
      return {
        ...state,
        package_name:'',
        location:'',
        memo:'',
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
    *getEditInfo({payload},{call , put}){
      let res = yield call( getPackageInfo, payload.id)
      if(res.code === 0){
        yield put({
          type : 'handleEdit',
          payload : res.data
        })
      }else{
        yield put(routerRedux.push('/packages'))
        message.error(res.msg)
        console.log('error======>',res)
      }
    },
    *editPackage({payload},{call , put}){
      let res = yield call( editPackageInfo, payload)
      if(res.code === 0){
        yield put({type:'handleRecommit',payload:{recommit:false}})
        yield put(routerRedux.push({
          pathname: `/packages/${payload.id}`,
        }))
        message.success('程序包修改成功')
      }else{
        yield put({type:'handleRecommit',payload:{recommit:false}})
        message.error(res.msg)
        console.log('error======>',res)
      }
    }
  },
  subscriptions:{}
}
