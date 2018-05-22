/**
 * Created by zhangmm on 2017/7/18.
 */
import { addFileInfo, getAllFile} from 'services/package'
import { message } from 'antd'
import { routerRedux } from 'dva/router'
import pathToRegexp from 'path-to-regexp'
import { Cache } from 'utils'
const cache = new Cache()

export default {
  namespace:'package/fileAdd',
  state:{
    disabledBut:true,
    allFile:[],
    recommit:false
  },
  reducers:{
    handleDisabledBut:(state , action)=>{
      return{
        ...state,
        disabledBut: action.payload
      }
    },
    handleAllFile:(state , action) =>{
      return{
        ...state,
        allFile: action.payload.allFile
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
    *addFileInfo({payload} , {call , put}){
      let res = yield call(addFileInfo , payload)
      if(res.code === 0){
/*        yield put(routerRedux.push({
          pathname: `/packages/${payload.id}/tree`,
        }))*/
        yield put({type:'handleRecommit',payload:{recommit:false}})
        window.history.go(-1)
        message.success("文件新增成功")
      }else{
        yield put({type:'handleRecommit',payload:{recommit:false}})
        message.error(res.msg)
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
        yield put(routerRedux.push(`/packages/${payload.id}/tree`))
        message.error(res.msg)
        console.log('error======>',res)
      }
    }
  },
  subscriptions:{
    setup({ dispatch, history}){
      history.listen(({pathname}) => {
        if (/packages(\/)info(\/)file(\/)(\d+)(\/)add$/.test(pathname)) {
          const match = pathToRegexp('/packages/info/file/:id/add').exec(pathname)
          if (match) {
            dispatch({
              type: 'handleDisabledBut',
              payload: true
            })
          }
          dispatch({
            type : `getAllFile`,
            payload : {
              id : match[1],
              filepath:cache.get('filepath') + cache.get('wholePath')
            }
          })
        }})
    }
  }
}
