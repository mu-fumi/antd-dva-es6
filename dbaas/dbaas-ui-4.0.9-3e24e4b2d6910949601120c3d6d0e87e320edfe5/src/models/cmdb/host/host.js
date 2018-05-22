/**
 * Created by zhangmm on 2017/8/21.
 */
import { deleteHost, importHost, deleteAllHost, getSetting, changeShowSettings } from 'services/cmdb'
import { Link , routerRedux } from 'dva/router'
import { message, Modal } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'host',
  state:{
    placeholder : '根据主机名、IP搜索',
    keyword : '',
    selectedRowKeys: [],//用来存放选中项key
    selectedRowItems:[],//用来存放选中项是否能批量删除的信息
    importVisible: false,
    /*executeVisible: false,*/
    machineVisible: false,
/*    task: {
      ssh: [false,'ssh信任'],
      user: [false,'创建用户'],
      zabbix: [false,'部署 Zabbix Agent'],
      initialize: [false,'安装环境依赖包'],
      /!*server: [false,'部署对比同步工具'],*!/
      health_full: [false,'部署实时诊断 Agent'],
      health_quick: [false,'部署一键检查 Agent'],
      backup: [false,'部署备份还原工具'],
      analysis_agent: [false,'部署性能分析工具']
    },*/
    file:'',
    /*templates: [],*/
   /* groups:'',*/
    setting:[],
    keys:[],
    dataSource:[],//服务列表数据
    settingUsingOk:[],//点击Ok用于改变值
    hostIP:{},
    reload:(+ new Date()),
    recommitReset:false,//防重复提交
    recommitConfirm:false,//防重复提交
  },
  reducers:{
    handleReload:(state) => {
      return {
        ...state,
        reload:(+ new Date())
      }
    },
    handleKeyword (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleFilter (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
/*    handleHostExeVisible (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },*/
    handleHostImpVisible (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleHostMachVisible (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleHostSelected (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
/*    handleHostTask (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },*/
    handleHostFile (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleHostSetting (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleHostSettingUsingOk (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleDatasource (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    handleHostIP (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    resetFilter(state) {
      return {
        ...state,
        keyword : ''
      }
    },
    handleRecommit (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
  },
  effects:{
    *deleteHost({payload} , {call , put}){
      let res = yield call(deleteHost , payload)
      if(res.code === 0){
        yield put(routerRedux.push({
          pathname: '/cmdb/host',
        }))
        message.success('主机删除成功')
      }else{
        message.error(res.msg)
      }
    },
    *deleteAllHost({payload} , {call , put}){
      let res = yield call(deleteAllHost , payload)
      if(res.code === 0){
        yield put({type:"handleReload"})
        yield put({
          type:"handleHostSelected",
          payload:{
            selectedRowKeys: [],
            selectedRowItems:[],
          }
        })
        message.success('主机批量删除成功')
      }else{
        message.error(res.msg)
      }
    },
/*    *executeHostBatch({payload} , {call , put}){
      let res = yield call(executeHostBatch , payload)
      if(res.code === 0){
        //yield put({type:"handleReload"})
        Modal.info({
          title:'批量任务已经执行',
          content:'提交成功,本次任务已在后台执行,耗时较长,您可以在任务列表查看进度及结果'
        })
      }else{
        message.error(res.msg)
      }
    },*/
    *importHost({payload} , {call , put}){
      let res = yield call(importHost , payload)
      if(res.code === 0){
        yield put({
          type:'handleHostImpVisible',
          payload:{
            importVisible: false
          }
        })
        yield put({type:"handleReload"})
        message.success('批量导入主机成功')
      }else{
        message.error(res.msg)
      }
    },
    *getSetting({payload} , {call , put}){
      let keys = []
      let res = yield call(getSetting , payload)
      if(res.code === 0){
        res.data.filter(v =>
          v.show === true
        ).map((v1,k1) =>{
          keys.push(v1['key'])
        })
        yield put({
          type:'handleHostSetting',
          payload:{
            setting: res.data,
            keys:keys
          }
        })
        yield put({
          type:'handleHostSettingUsingOk',
          payload:{
            settingUsingOk: res.data,
          }
        })
      }else{
        message.error(res.msg)
      }
    },
    *changeShowSettings({payload} , { call, put }){
      let res = yield call(changeShowSettings , payload)
      if(res.code === 0){
        yield put({type:'handleRecommit',payload:{recommitConfirm:false}})
        message.success("列表字段设置成功")
      }else{
        yield put({type:'handleRecommit',payload:{recommitConfirm:false}})
        message.error(res.msg)
      }
    },
    *resetSettings({payload} , { call, put }){
      let res = yield call(changeShowSettings , payload)
      if(res.code === 0){
        yield put({type:'handleRecommit',payload:{recommitReset:false}})
        message.success("列表字段恢复默认成功")
      }else{
        yield put({type:'handleRecommit',payload:{recommitReset:false}})
        message.error(res.msg)
      }
    },
    *resetSettingsLeave({payload} , { call }){
      let res = yield call(changeShowSettings , payload)
    },
  },
  subscriptions:{
  }
}
