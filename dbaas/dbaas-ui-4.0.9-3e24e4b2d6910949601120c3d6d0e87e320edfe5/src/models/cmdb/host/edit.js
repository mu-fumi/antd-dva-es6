/**
 * Created by zhangmm on 2017/8/23.
 */
import { getHost, editHost, getCity, getIdc, getUsers, getType, getConnectType } from 'services/cmdb'
import { routerRedux } from 'dva/router'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'editHost',
  state:{
      city:"",
      connect_ip:"",
      /*connect_status:"",
      devops_name:"",*/
      type:'',//类型
      connect_type:[],//连接方式
      idc:"",
      name:"",
      priority:0,
      tag:"",
      weight:0,
      citys:"",
      idcs:"",
      types:"",
      connectTypes:"",
      //devops_names:"",
      /*inputVisibility:true*/
      ipText:"显示 IP 属性...",
      ipVisibility:false,
      certificateText:"显示凭证属性...",
      certificateVisibility:false,
      attributeText:"显示可自动发现的属性...",
      attributeVisibility:false,
      business_ip1:"",
      business_ip2:"",
      business_vip1:"",
      business_vip2:"",
      admin_ip1:"",
      admin_vip1:"",
      connect_ip:"",
      root_name:"",
      root_password:"",
      user_name:"",
      user_password:"",
      connect_port:"",
      remember_token:"",
      os_arch:"",
      os_version:"",
      os_kernel:"",
      mounts:"",
      processor:"",
      interfaces:"",
      recommit:false//防重复提交
  },
  reducers:{
    handleHost (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleCity (state , action) {
      return {
        ...state,
        citys:action.payload
      }
    },
    handleIdc (state , action) {
      return {
        ...state,
        idcs:action.payload
      }
    },
    handleType (state , action) {
      return {
        ...state,
        types:action.payload
      }
    },
    handleConnectType (state , action) {
      return {
        ...state,
        connectTypes:action.payload
      }
    },
/*    handleDevops_name (state , action) {
      return {
        ...state,
        devops_names:action.payload
      }
    },*/
/*    handleInputVisibility (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },*/
    handleIdcChange (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleCityChange (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleIPShow (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleCertificateShow (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleAttributeShow (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleRecommit (state , action) {
      return {
        ...state,
        recommit:action.payload.recommit
      }
    },
    handleReset (state) {
      return {
        ...state,
        city:"",
        connect_ip:"",
        /*connect_status:"",
        devops_name:"",*/
        type:'',//类型
        connect_type:[],//连接方式
        idc:"",
        name:"",
        priority:0,
        tag:"",
        weight:0,
        citys:"",
        idcs:"",
        types:"",
        connectTypes:"",
        //devops_names:"",
        /*inputVisibility:true*/
        ipText:"显示 IP 属性...",
        ipVisibility:false,
        certificateText:"显示凭证属性...",
        certificateVisibility:false,
        attributeText:"显示可自动发现的属性...",
        attributeVisibility:false,
        business_ip1:"",
        business_ip2:"",
        business_vip1:"",
        business_vip2:"",
        admin_ip1:"",
        admin_vip1:"",
        connect_ip:"",
        root_name:"",
        root_password:"",
        user_name:"",
        user_password:"",
        connect_port:"",
        remember_token:"",
        os_arch:"",
        os_version:"",
        os_kernel:"",
        mounts:"",
        processor:"",
        interfaces:"",
        recommit:false//防重复提交
      }
    },
  },
  effects:{
    *editHost({payload , id} , {call,put}){
      let res = yield call(editHost , payload , id)
      if(res.code === 0){
        yield put({type:'handleRecommit',payload:{recommit:false}})
        yield put(routerRedux.push({
          pathname: '/cmdb/host',
        }))
        message.success('主机修改成功')
      }else{
        yield put({type:'handleRecommit',payload:{recommit:false}})
        message.error(res.msg)
      }
    },
    *getHost({payload} , {call , put}){
      let res = yield call(getHost , payload)
      if(res.code === 0){
        yield put({
          type:'handleHost',
          payload:{
            ...res.data.basic,
            ...res.data.ip,
            ...res.data.disk,
            ...res.data.certificate,
            ...res.data.system
          }
        })
      }else{
        yield put(routerRedux.push('/cmdb/host'))
        message.error(res.msg)
      }
    },
    *getCity({payload} , {call , put}){
      let res = yield call(getCity , payload)
      if(res.code === 0){
        yield put({
          type:'handleCity',
          payload:res.data.value
        })
      }else{
        message.error(res.msg)
      }
    },
    *getIdc({payload} , {call , put}){
      let res = yield call(getIdc , payload)
      if(res.code === 0){
        yield put({
          type:'handleIdc',
          payload:res.data.value
        })
      }else{
        message.error(res.msg)
      }
    },
    *getType({payload} , {call , put}){
      let res = yield call(getType , payload)
      if(res.code === 0){
        yield put({
          type:'handleType',
          payload:res.data.value
        })
      }else{
        message.error(res.msg)
      }
    },
    *getConnectType({payload} , {call , put}){
      let res = yield call(getConnectType , payload)
      if(res.code === 0){
        yield put({
          type:'handleConnectType',
          payload:res.data.value
        })
      }else{
        message.error(res.msg)
      }
    },
/*    *getDevops_name({payload} , {call , put}){
      let res = yield call(getUsers , payload)
      if(res.code === 0){
        yield put({
          type:'handleDevops_name',
          payload:res.data.data
        })
      }else{
        message.error(res.msg)
      }
    }*/
  },
  subscriptions:{
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/cmdb(\/)host(\/)(\d+)(\/)edit$/.test(pathname)) {
          const path = pathToRegexp('/cmdb/host/:id(\\d+)/edit').exec(pathname)
          const id = path[1]
          dispatch({
            type : `getHost`,
            payload : {id: id}
          })
          dispatch({
            type : `getCity`
          })
          dispatch({
            type : `getIdc`
          })
          dispatch({
            type : `getType`
          })
          dispatch({
            type : `getConnectType`
          })
          /*dispatch({
            type : `getDevops_name`
          })*/
        }})
    }
  }
}
