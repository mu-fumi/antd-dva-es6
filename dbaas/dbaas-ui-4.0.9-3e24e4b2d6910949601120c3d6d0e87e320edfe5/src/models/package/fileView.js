/**
 * Created by zhangmm on 2017/7/5.
 */
import { getVersionFileInfo} from 'services/package'
import { message } from 'antd'
export default {
  namespace:'package/fileView',
  state:{
    content:"",
    binary:false,
    charset:"",
    executable:false,
    name:"",
    path:"",
    size:0,
    script_type:"shell",
    spinning:false
  },
  reducers:{
    handleFile:(state , action)=>{
      return{
        ...state,
        ...action.payload
      }
    },
    resetFileInfo:(state , action)=>{
      return{
        ...state,
        content:"",
        binary:false,
        charset:"",
        executable:false,
        name:"",
        path:"",
        size:0,
        script_type:"shell"
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
    *getVersionFileInfo({payload} , {call , put}){
      yield put({
        type:"handleSpinning",
        payload: {spinning:true}
      })
      let res = yield call( getVersionFileInfo, payload)
      if(res.code === 0){
        yield put({
          type : 'handleFile',
          payload : res.data
        })
      }else{
        message.error(res.msg)
        console.log('error======>',res)
      }
      yield put({
        type:"handleSpinning",
        payload: {spinning:false}
      })
    }
  },
  subscriptions:{}
}
