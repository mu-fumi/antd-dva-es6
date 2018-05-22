/**
 * Created by wengyian on 2017/7/7.
 */

import { getStackTags, checkStackUnique, addStack } from 'services/stack'
import { Modal, message } from 'antd'
import { Link, routerRedux } from 'dva/router'
import pathToRegexp from 'path-to-regexp'
import _ from 'lodash'

export default {
  namespace : 'stack/addStack',
  state : {
    currentStep : 0,
    stackInfo : {},
    chosenService : [],
    stackTags : [],
    selectedService : {}
  },
  reducers : {
    plusCurrentStep(state, action){
      return {
        ...state,
        currentStep : state.currentStep + 1
      }
    },

    setCurrentStep(state, action){
      return {
        ...state,
        currentStep : action.payload
      }
    },

    minusCurrentStep(state, acion){
      return {
        ...state,
        currentStep : state.currentStep - 1
      }
    },

    initState(state, action){
      return {
        ...state,
        currentStep : 0,
        stackInfo : {},
        selectedService : {},
        chosenService : [],
        stackTags : [],
      }
    },

    setStackInfo(state, action){
      return {
        ...state,
        stackInfo : action.payload
      }
    },

    setChooseService(state, action){
      return {
        ...state,
        chosenService : action.payload
      }
    },

    setStackTags(state, action){
      return {
        ...state,
        stackTags : action.payload
      }
    },

    setSelectedService(state, action){
      const isSelected = action.payload.isSelected
      const selectedItem = action.payload.selectedItem
      let oldSelectedService = state.selectedService
      if(isSelected){
        if(_.isArray(selectedItem)){
          Object.values(selectedItem).forEach(item => {
            oldSelectedService[item.id] = item
          })
        }else if(_.isPlainObject(selectedItem)){
          oldSelectedService[selectedItem.id] = selectedItem
        }
      }else{
        if(_.isArray(selectedItem)){
          Object.values(selectedItem).forEach(item => {
            delete oldSelectedService[item.id]
          })
        }else if(_.isPlainObject(selectedItem)){
          delete oldSelectedService[selectedItem.id]
        }
      }

      return {
        ...state,
        selectedService : oldSelectedService
      }
    },

    clearSelectedService(state, action){
      return {
        ...state,
        selectedService : {}
      }
    },

    clearInfo(state, action){
      let params = window.location.search
      if(params && params.includes('from=2')){
        return {
          ...state,
          selectedService : {}
        }
      }else{
        return {
          ...state,
          currentStep : 0,
          stackInfo : {},
          selectedService : {},
          stackTags : [],
          chosenService : [],
        }
      }
    }

  },
  effects : {
    *getStackTags({
      payload
    }, { put, call }){
      const res = yield call(getStackTags)
      if(res.code === 0){
        yield put({
          type : 'setStackTags',
          payload : res.data
        })
      }else{
        message.error( res.error || res.msg)
      }
    },

    *addStack({
      payload
    }, { put, call }){
      const res = yield call(addStack, payload)
      if(res.code === 0){
        yield put({
          type : 'initState',
        })
        yield put(routerRedux.push('/cmdb/component/stack-view'))
      }else{
        message.error( res.error || res.msg)
      }
    },

  },
  subscriptions : {
    setup({ dispatch, history}){
      history.listen(({pathname}) => {
        const match = pathToRegexp('/cmdb/component/addStack').exec(pathname)
        if(match){
          dispatch({
            type : 'getStackTags'
          })
          let url = location.search
          if(url.includes('from=2')){
            dispatch({
              type : 'setCurrentStep',
              payload : 1
            })
          }
        }
      })
    }
  }
}
