/**
 * Created by zhangmm on 2017/11/01.
 */
import { getBusiness, deleteBusiness } from 'services/cmdb'
//import { Link , browserHistory } from 'dva/router'
import { routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'
import { Cache } from 'utils'
const cookie = new Cache('cookie')

export default {
  namespace:'busDetail',
  state:{
    business:{}
  },
  reducers:{
    handleReset (state , action) {
      return {
        ...state,
        business:{}
      }
    },
    handleBusiness (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
  },
  effects:{
    *getBusiness({payload} , {call , put}){
      let res = yield call(getBusiness , payload )
      if(res.code === 0){

        yield put({
          type : 'app/handlePageBtns',
          payload : {props: {id:payload.id,disabled:res.data.level === 1 ? false :
            (cookie.get('uid') === res.data.user_id ? false : true)}}
        })
        yield put({
          type:'handleBusiness',
          payload:{
            business:res.data
          }
        })
      }else{
        yield put(routerRedux.push('/cmdb/business'))
        message.error(res.msg)
      }
    },
    *deleteBusiness({payload} , {call , put}){
      let res = yield call(deleteBusiness , payload)
      if(res.code === 0){
        yield put(routerRedux.push({
          pathname: '/cmdb/business',
        }))
        message.success("业务删除成功")
      }else{
        message.error(res.msg)
      }
    }
  },
  subscriptions:{
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/cmdb(\/)business(\/)(\d+)(\/)detail/.test(pathname)) {
          const path = pathToRegexp('/cmdb/business/:id(\\d+)/detail').exec(pathname)
          const id = path[1]
          dispatch({
            type : `getBusiness`,
            payload : {id: id}
          })
        }})
    }
  }
}
