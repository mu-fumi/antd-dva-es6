/**
 * Created by zhangmm on 2017/7/4.
 */
import { getPackageInfo , updateMemoInfo , deleteVersionInfo, deletePackage ,
  getVersion, compressPackage, importPackage} from 'services/package'
import { Link , routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'package/detail',
  state:{
    info:{
      version_diff:true,
      version_del:true,
    },
    updateModalVisible:false,
    importModalVisible:false,
    okText:'确定',
    cancelText:'取消',
    version:'',
    disable:false,
    memo:'',
    loading:true,
    spinning:false,
    reload:(+ new Date())
  },
  reducers:{
    handleReload:(state) => {
      return {
        ...state,
        reload:(+ new Date())
      }
    },
    handlePackage:(state , action) => {
      return{
        ...state,
        info:action.payload
      }
    },
    handleParams:(state , action)=>{
      return{
        ...state,
        ...action.payload
      }
    },
    handleVisibility:(state , action)=>{
      return{
        ...state,
        updateModalVisible:action.payload
      }
    },
    handleImpVisibility:(state , action)=>{
      return{
        ...state,
        importModalVisible:action.payload.importModalVisible
      }
    },
    handleMemo:(state , action)=>{
      return{
        ...state,
        ...action.payload
      }
    },
/*    handlePath:(state , action)=>{
      return{
        ...state,
        ...action.payload
      }
    },*/
    handleDelete:(state , action)=>{
      return{
        ...state,
        ...action.payload
      }
    },
/*    deleteVisibility:(state , action)=>{
      return{
        ...state,
        deleteModalVisible:action.payload
      }
    },*/
/*    packageVisibility:(state , action)=>{
      return{
        ...state,
        packageModalVisible:action.payload.packageModalVisible,
        version:action.payload.version
      }
    },*/
    handleVersion:(state , action)=>{
      return{
        ...state,
       versionList:{
         ...action.payload
       }
      }
    },
    handleLoadingFalse:(state , action)=>{
      return{
        ...state,
        loading:false
      }
    },
    handleLoadingTrue:(state , action)=>{
      return{
        ...state,
        loading:true
      }
    },
    handleSpinning:(state , action)=>{
      return{
        ...state,
        ...action.payload
      }
    },
    handleReset (state) {
      return {
        info:{
          version_diff:true,
          version_del:true,
        },
        updateModalVisible:false,
        importModalVisible:false,
        okText:'确定',
        cancelText:'取消',
        version:'',
        disable:false,
        memo:'',
        loading:true,
        spinning:false,
        reload:(+ new Date())
      }
    },
  },
  effects:{
    *getDetails({payload} , {call , put}){
      let res = yield call(getPackageInfo , payload.pkgid)
      if(res.code === 0){
        yield put({
          type : 'handlePackage',
          payload : res.data
        })
        yield put({
          type : 'app/handlePageBtns',
          payload : {props: {id:payload.pkgid, detail: res.data }}
        })
      }else{
        yield put(routerRedux.push('/packages'))
        message.error(res.msg)
      }
    },
    *updateMemo({payload} , {call , put}){
      let res = yield call(updateMemoInfo , payload)
      if(res.code === 0){
        yield put({
          type : 'handleVisibility',
          payload : !payload.visible
        })
        yield put({
          type : 'handleReload'
        })
        message.success("备注修改成功")
      }else{
        message.error(res.msg)
      }
    },
    *handleCompress({payload} , {call , put}){
      let res = yield call(compressPackage , payload)
      if(res.code === 0){
        yield put({
          type : 'handleReload'
        })
        message.success("程序包压缩成功")
      }else{
        message.error(res.msg)
      }
      yield put({
        type : 'handleSpinning',
        payload:{spinning:false}
      })
    },
    *deleteVersion({payload} , {call , put}){
      let res = yield call(deleteVersionInfo , payload)
      if(res.code === 0){

        yield put({
          type:'getDetails',
          payload : {pkgid : payload.id}
        })
        yield put({
         type: 'handleReload'
        })
        message.success("版本删除成功")
      }else{
        message.error(res.msg)
      }
    },
    *deletePackage({payload} , {call, put}){
      let res = yield call(deletePackage , payload)
      if(res.code === 0){
        yield put(routerRedux.push({
          pathname: '/packages',
        }))
        message.success('程序包删除成功')
      }else{
        message.error(res.msg)
      }
    },
    *getVersionList({payload} , {call , put}){
      /*yield put({type : 'handleLoadingTrue'})*/
      let res = yield call(getVersion , payload)
      if(res.code === 0){
        yield put({
          type : 'handleVersion',
          payload : res.data
        })
      }else{
      }
    },
    *importPackage({payload} , {call , put}){
      let res = yield call(importPackage , payload)
      if(res.code === 0){
        yield put({
          type : 'handleImpVisibility',
          payload : {
            importModalVisible:!payload.visible
          }
        })
        yield put(routerRedux.push({
          pathname: `/packages/${payload.id}/tree`,
        }))
        message.success("程序包导入成功")
      }else{
        message.error(res.msg)
      }
    },
  },
  subscriptions:{
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/packages(\/)(\d+)$/.test(pathname)) {
          const path = pathToRegexp('/packages/:id(\\d+)').exec(pathname)
          const id = path[1]
          dispatch({
            type : `getDetails`,
            payload : {pkgid : id}
          })
        }})
    }
  }
}
