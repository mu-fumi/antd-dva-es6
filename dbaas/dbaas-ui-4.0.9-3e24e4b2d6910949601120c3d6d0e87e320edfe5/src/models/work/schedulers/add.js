/**
 * Created by wengyian on 2017/6/28.
 */

import pathToRegexp from 'path-to-regexp'
import { getTools, submitAddSchedule, getSchedule, submitEditSchedule } from 'services/schedulers'
import { Modal, message } from 'antd'
import { Link, routerRedux } from 'dva/router'
import { MACHINE_COLUMN_TYPE } from 'utils/constant'


export default {
  namespace : 'work/schedulers/add',
  state : {
    tools : [],
    needShowTools : [],
    chosenToolItem : {},
    ToolModalVisible : false,
    scheduleObj : {},
    isCreate : false,
    activeKey : 1,
    scheduleId : 0,
    machineModalVisible : false,
    machineModalType : 'table', // table 时显示出tabel， 当为 column 时，显示列表设置
    defaultColumns : ['machine_name', 'idc', 'machine_ip'],
    needShowColumns : ['machine_name', 'idc', 'machine_ip'],
    newColumns : ['machine_name', 'idc', 'machine_ip'],
    selectedIps : [],
    filter : {
      keywords : ''
    },
    errTip : {
      minute : '',
      hour : '',
      day : '',
      month : '',
      week : ''
    },
    onceErr : false
  },
  reducers : {

    setTools(state, action){
      return {
        ...state,
        tools : action.payload,
        needShowTools : action.payload
      }
    },

    setNeedShowTools(state, action){
      let content = action.payload || ''
      const { tools } = state
      let needShowTools = []
      if(content===''){
        needShowTools = tools
      }else{
        tools.forEach((item, key) => {
          if(item.tool_name.includes(content)){
            needShowTools.push(item)
          }
        })
      }
      return {
        ...state,
        needShowTools : needShowTools
      }
    },

    setChosenToolItem(state, action){
      return {
        ...state,
        chosenToolItem: action.payload
      }
    },

    hideToolModal(state, action){
      return {
        ...state,
        ToolModalVisible : false
      }
    },

    showToolModal(state, action){
      return {
        ...state,
        ToolModalVisible : true
      }
    },

    setSchedule(state, action){
      return {
        ...state,
        scheduleObj : action.payload
      }
    },

    setIsCreate(state, action){
      return {
        ...state,
        isCreate : action.payload
      }
    },

    setActiveKey(state, action){
      return {
        ...state,
        activeKey : action.payload
      }
    },

    setScheduleId(state, action){
      return {
        ...state,
        scheduleId : action.payload
      }
    },

    // 机器筛选部分
    showMachineModal(state, action){
      return {
        ...state,
        machineModalVisible : true
      }
    },

    hideMachineModal(state, action){
      return {
        ...state,
        machineModalVisible : false
      }
    },

    setMachineModalType(state, action){
      return {
        ...state,
        machineModalType: action.payload
      }
    },

    setSelectedIps(state, action){
      return{
        ...state,
        selectedIps : action.payload
      }
    },

    setNewColumns(state, action){
      return{
        ...state,
        newColumns : action.payload
      }
    },

    setNeedShowColumns(state, action){
      return {
        ...state,
        needShowColumns: state.newColumns
      }
    },

    resetNewColumns(state, action){
      return {
        ...state,
        newColumns: state.defaultColumns
      }
    },

    handleFilter(state, action){
      return {
        ...state,
        filter : {
          ...state.filter,
          ...action.payload
        }
      }
    },

    setErrTip(state, action){
      return {
        ...state,
        errTip : {
          ...state.errTip,
          ...action.payload
        }
      }
    },

    setOnceErr(state, action){
      return {
        ...state,
        onceErr : action.payload
      }
    }

  },
  effects : {
    *getTools({
      payload
    }, { put, call}){
      const res = yield call(getTools)
      if(res.code === 0){
        yield put({
          type : 'setTools',
          payload : res.data
        })
      }else{
        message.error(res.error || res.msg)
      }
    },

   *submitAddSchedule({
     payload
   }, { put, call }){

     const res = yield call(submitAddSchedule, payload)
     if(res.code === 0){
       message.success('保存任务成功')
       yield put(routerRedux.push('/schedulers'))
     }else{
       message.error(res.error || res.msg)
     }
   },

   *submitEditSchedule({
     payload
   }, { put, call }){
     const res = yield call(submitEditSchedule, payload)
     if(res.code === 0){
       message.success('编辑任务成功')
       yield put(routerRedux.push('/schedulers'))
     }else{
       message.error(res.error || res.msg)
     }
   },

   *getSchedule({
     payload
   }, { put, call }){
     const res = yield call(getSchedule, payload)
     if(res.code === 0){
       // debugger
       yield put({
         type : 'setSchedule',
         payload : res.data
       })
       yield put({
         type : 'setChosenToolItem',
         payload : {
           tool_id : res.data.tool_id,
           tool_name : res.data.tool_name
         }
       })
       yield put({
         type : 'setActiveKey',
         payload : res.data.need_repeat
       })
     }else{
       message.error(res.error || res.msg)
     }
   },

  },
  subscriptions : {
    setup({ dispatch, history }){
      history.listen(({ pathname }) => {

        const match = pathToRegexp('/schedulers/:id').exec(pathname)
        if(match){
          dispatch({
            type : 'getTools'
          })
          if(match[1] !== 'add'){//表示为编辑定时任务
            dispatch({
              type : 'setIsCreate',
              payload : false
            })
            dispatch({
              type : 'getSchedule',
              payload : match[1]
            })
            dispatch({
              type : 'setScheduleId',
              payload : match[1]
            })
          }else{
            dispatch({
              type : 'setIsCreate',
              payload : true
            })
          }
        }
      })
    }
  }
}
