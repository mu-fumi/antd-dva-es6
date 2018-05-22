/**
 * Created by zhangmm on 2017/7/14.
 */
import { deleteFile , getFileInfo } from 'services/package'
import { message } from 'antd'
import { routerRedux } from 'dva/router'
import pathToRegexp from 'path-to-regexp'
import { Cache } from 'utils'
const cache = new Cache()

export default {
  namespace:'package/fileManage',
  state:{
    content:"",
    binary:false,
    charset:"",
    executable:false,
    name:"",
    path:"",
    size:0,
    script_type:"shell",
    /*binaryOrNot:false,*/
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
        script_type:"shell",
        /*binaryOrNot:false,*/
      }
    },
/*    handleBinaryOrNot:(state , action)=>{
      return{
        ...state,
        binaryOrNot: action.payload
      }
    },*/
    handleSpinning (state , action) {
      return {
        ...state,
        spinning:action.payload.spinning
      }
    },
  },
  effects:{
    *deleteFile({payload}, { call, put }){
      let res = yield call( deleteFile, payload)
      if(res.code === 0){
/*        yield put(routerRedux.push({
          pathname: `/packages/${payload.id}/tree`,
        }))*/
        window.history.go(-1)
        message.success("文件删除成功")
      }else{
        message.error(res.msg)
        console.log('error======>',res)
      }
    },
    *getFileInfo({payload} , {call , put}){
      yield put({
        type:"handleSpinning",
        payload: {spinning:true}
      })
      let res = yield call( getFileInfo, payload)
      if(res.code === 0){
/*        yield put({
          type : 'handleBinaryOrNot',
          payload : false
        })*/
        yield put({
          type : 'handleFile',
          payload : res.data
        })
        yield put({
          type : 'app/handlePageBtns',
          payload : {props: {id:payload.id}}
        })
      }else{
/*        yield put({
          type : 'handleBinaryOrNot',
          payload : true
        })*/
        message.error(res.msg)
        console.log('error======>',res)
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
        if (/packages(\/)file(\/)(\d+)(\/)([\u4e00-\u9fa5\-\.\w\d]+)$/.test(pathname)) {
          const path = pathToRegexp('/packages/file/:id(\\d+)/:name([\u4e00-\u9fa5\-\.\\w\\d]+)').exec(pathname)
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
