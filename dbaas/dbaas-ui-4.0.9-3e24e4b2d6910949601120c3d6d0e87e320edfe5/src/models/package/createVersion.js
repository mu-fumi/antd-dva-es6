/**
 * Created by zhangmm on 2017/7/5.
 */
import { upload , deleteAllFile , createPath, getAllFile } from 'services/package'
import { message } from 'antd'
import { routerRedux } from 'dva/router'
import pathToRegexp from 'path-to-regexp'
import { Cache } from 'utils'
const cache = new Cache()

export default {
  namespace:'package/createVersion',
  state:{
    reload : (+ new Date()),
    uploadModalVisible:false,
    file:'',
    okText:'提交',
    cancelText:'取消',
    pathVisible:false,
    spinning:false,
    allFile:[]
  },
  reducers:{
    handleReload:(state)=>{
      return {
        ...state,
        reload : (+ new Date())
      }
    },
    handleVisibility:(state , action)=>{
      return{
        ...state,
        ...action.payload
      }
    },
    handleFile:(state , action) =>{
      return{
        ...state,
        ...action.payload
      }
    },
    handlePath:(state , action) =>{
      return{
        ...state,
        pathVisible: action.payload
      }
    },
    handleSpinning:(state , action) =>{
      return{
        ...state,
        spinning: action.payload.spinning
      }
    },
    handleAllFile:(state , action) =>{
      return{
        ...state,
        allFile: action.payload.allFile
      }
    },
  },
  effects:{
    *uploadFile({payload} , {call , put}){
      let res = yield call( upload, payload)
      if(res.code === 0){
        yield put({
          type : 'handleReload'
        })
        yield put({//上传成功后刷新allFile
          type:'getAllFile',
          payload:{
            id:payload.pkgid,
            filepath:cache.get('filepath') + cache.get('wholePath')
          }
        })
        message.success("文件上传成功！")
      }else{
        message.error(res.msg)
        console.log('error======>',res)
      }
      yield put({
        type : 'handleSpinning',
        payload:{spinning:false}
      })
    },
    *deleteAllFile({payload} , {call , put}){
      let res = yield call( deleteAllFile, payload)
      if(res.code === 0){
        yield put(routerRedux.push({
          pathname: `/packages/${payload.id}`,
        }))
        message.success("文件删除成功！")
      }else{
        message.error(res.msg)
        console.log('error======>',res)
      }
    },
    *createPath({payload} , {call , put}){
      let res = yield call( createPath, payload)
      if(res.code === 0){
        yield put({
          type: 'handleReload'
        })
        yield put({//上传成功后刷新allFile
          type:'getAllFile',
          payload:{
            id:payload.id,
            filepath:cache.get('filepath') + cache.get('wholePath')
          }
        })
        message.success("路径创建成功！")
      }else{
        message.error(res.msg)
        console.log('error======>',res)
      }
    },
    *getAllFile({payload} , {call , put}){
      let res = yield call( getAllFile, payload)
      if(res.code === 0){
        yield put({
          type:'handleAllFile',
          payload:{
            allFile:res.data.map((v,k) =>{
              return v.file
            })
          }
        })
      }else{
        yield put(routerRedux.push(`/packages/${payload.id}`))
        message.error(res.msg)
        console.log('error======>',res)
      }
    }
  },
  subscriptions:{
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/packages(\/)(\d+)(\/)tree$/.test(pathname)) {
          const path = pathToRegexp('/packages/:id(\\d+)/tree').exec(pathname)
          const id = path[1]
          dispatch({
            type : `getAllFile`,
            payload : {
              id : id,
              filepath:cache.get('filepath')//这个时候没有wholepath
            }
          })
        }})
    }
  }
}
