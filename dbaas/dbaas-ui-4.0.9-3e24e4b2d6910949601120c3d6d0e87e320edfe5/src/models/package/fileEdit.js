/**
 * Created by zhangmm on 2017/7/18.
 */
import { editFileInfo , getFileInfo} from 'services/package'
import { message } from 'antd'
import { routerRedux } from 'dva/router'
import pathToRegexp from 'path-to-regexp'
import { Cache } from 'utils'
const cache = new Cache()

export default {
  namespace:'package/fileEdit',
  state:{
    content:"",
    binary:false,
    charset:"",
    executable:false,
    originName:"",
    name:"",
    path:"",
    size:0,
    script_type:"shell",
    spinning:false,
    recommit:false
  },
  reducers:{
    handleFile:(state , action)=>{
      return{
        ...state,
        ...action.payload,
        /*content:action.payload.content,*/
        originName:action.payload.name
      }
    },
    handleContent:(state , action)=>{
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
        originName:"",
        name:"",
        path:"",
        size:0,
        script_type:"shell",
        recommit:false
      }
    },
    handleSpinning (state , action) {
      return {
        ...state,
        spinning:action.payload.spinning
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
    *editFileInfo({payload} , {call , put}){
      let res = yield call(editFileInfo , payload)
      const nameList = payload.name.split("/")
      const name = nameList[nameList.length - 1]
      if(res.code === 0){
/*        yield put(routerRedux.push({
          pathname: `/packages/file/${payload.id}/${name}`
        }))*/
        yield put({type:'handleRecommit',payload:{recommit:false}})
        window.history.go(-2)
        message.success("文件修改成功")
      }else{
        yield put({type:'handleRecommit',payload:{recommit:false}})
        message.error(res.msg)
      }
    },
    *getFileInfo({payload} , {call , put}){
      yield put({
        type:"handleSpinning",
        payload: {spinning:true}
      })
      let res = yield call( getFileInfo, payload)
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
  subscriptions:{
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/packages(\/)file(\/)(\d+)(\/)([\u4e00-\u9fa5\-\.\w\d]+)(\/)info$/.test(pathname)) {
          const path = pathToRegexp('/packages/file/:id(\\d+)/:name([\u4e00-\u9fa5\-\.\\w\\d]+)/info').exec(pathname)
          const id = path[1]
          const name = path[2]
          const filepath = cache.get("filepath")
          const wholePath = cache.get("wholePath") ? cache.get("wholePath") : ""
          dispatch({
            type:"getFileInfo",
            payload:{
              id:id,
              name:encodeURI(filepath + wholePath + "/" + name)
            }
          })
        }})
    }
  }
}
