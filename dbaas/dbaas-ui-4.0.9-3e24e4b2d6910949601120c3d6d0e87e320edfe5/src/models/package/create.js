/**
 * Created by zhangmm on 2017/7/4.
 */
import { addPackage } from 'services/package'
import { routerRedux } from 'dva/router'
import { message } from 'antd'
export default {
  namespace:'package/create',
  state:{
    package_name:'',
    location:'',
    memo:'',
    from:"",
    recommit:false//防重复提交
  },
  reducers:{
    handleFrom:(state , action) =>{
      return{
        ...state,
        from: action.payload
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
    *packageSubmit({payload}, { call , select , put }){
      let res = yield call( addPackage, payload.formData)
      const { from } = yield select((state) => { return state['package/create']})
      if(res.code === 0){
        if(from === "1"){
          yield put(routerRedux.push({
            pathname: '/cmdb/component/createService?from=1',
          }))
        }else{
          yield put(routerRedux.push({
            pathname: '/packages',
          }))
        }
        yield put({type:'handleRecommit',payload:{recommit:false}})
        message.success('程序包新增成功')
      }else{
        yield put({type:'handleRecommit',payload:{recommit:false}})
        console.log('error======>',res)
        message.error(res.msg)
      }
    },
  },
  subscriptions:{}
}
