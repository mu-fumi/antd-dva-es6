/**
 * Created by wengyian on 2017/7/22.
 */

import {
  getStackTags, checkStackUnique, getStackSummary, stackUpdate,
  deleteStackService, getStackConfig, updateStackConfig, updateStackService
} from 'services/stack'
import {Modal, message} from 'antd'
import {Link, routerRedux} from 'dva/router'
import pathToRegexp from 'path-to-regexp'
import _ from 'lodash'

export default {
  namespace: 'stack/editStack',
  state: {
    stackInfo: {
      name: '',
      version: '',
      tag: '',
      description: ''
    },
    stackTags: [],
    reload: 0,
    stackId: 0,
    deploymentModalVisible: false,
    stackConfig: {},
    currentStep: 0,
    chosenService: [],
    selectedService: {},
    serviceId: -1
  },
  reducers: {
    handleReload(state, aciton){
      return {
        ...state,
        reload: ( +new Date())
      }
    },

    setStackTags(state, action){
      return {
        ...state,
        stackTags: action.payload
      }
    },

    setStackInfo(state, action){
      return {
        ...state,
        stackInfo: action.payload
      }
    },

    setStackId(state, action){
      return {
        ...state,
        stackId: action.payload
      }
    },

    showDeploymentModal(state, action){
      return {
        ...state,
        deploymentModalVisible: true
      }
    },

    hideDeploymentModal(state, action){
      return {
        ...state,
        deploymentModalVisible: false
      }
    },

    setStackConfig(state, action){
      return {
        ...state,
        stackConfig: action.payload
      }
    },

    setServiceId(state, action){
      return {
        ...state,
        serviceId: action.payload
      }
    },

    setChooseService(state, action){
      return {
        ...state,
        chosenService: action.payload
      }
    },

    plusCurrentStep(state, action){
      return {
        ...state,
        currentStep: state.currentStep + 1
      }
    },

    minusCurrentStep(state, acion){
      return {
        ...state,
        currentStep: state.currentStep - 1
      }
    },


    setSelectedService(state, action){
      const isSelected = action.payload.isSelected
      const selectedItem = action.payload.selectedItem
      let oldSelectedService = state.selectedService
      if (isSelected) {
        if (_.isArray(selectedItem)) {
          Object.values(selectedItem).forEach(item => {
            oldSelectedService[item.id] = item
          })
        } else if (_.isPlainObject(selectedItem)) {
          oldSelectedService[selectedItem.id] = selectedItem
        }
      } else {
        if (_.isArray(selectedItem)) {
          Object.values(selectedItem).forEach(item => {
            delete oldSelectedService[item.id]
          })
        } else if (_.isPlainObject(selectedItem)) {
          delete oldSelectedService[selectedItem.id]
        }
      }

      return {
        ...state,
        selectedService: oldSelectedService
      }
    },

    initAddStackService(state, action){
      return {
        ...state,
        ...action.payload
      }
    },

    initStackConfig(state, action){
      return {
        ...state,
        stackConfig: {}
      }
    }

  },
  effects: {
    *getStackTags({
                    payload
                  }, {put, call}){
      const res = yield call(getStackTags)
      if (res.code === 0) {
        yield put({
          type: 'setStackTags',
          payload: res.data
        })
      } else {
        message.error(res.error || res.msg)
      }
    },

    *getStackSummary({
                       payload
                     }, {put, call}){
      const params = {
        stack_id : payload,
        paginate : 0
      }
      const res = yield call(getStackSummary, params)
      if (res.code === 0) {
        if (_.isEmpty(res.data)) {
          yield put(routerRedux.push('/cmdb/component/stack-view'))
        } else {
          yield put({
            type: 'setStackInfo',
            payload: res.data[0]
          })
        }
      } else {
        message.error(res.error || res.msg)
      }
    },

    *submitStackInfo({
                       payload
                     }, {put, call}){
      const res = yield call(stackUpdate, payload)
      if (res.code === 0) {
        message.success('修改成功!')
        yield put({
          type: 'setStackInfo',
          payload: payload,
        })
      } else {
        message.error(res.error || res.msg)
      }
    },

    *deleteStackService({
                          payload
                        }, {put, call}){
      const res = yield call(deleteStackService, payload)
      if (res.code === 0) {
        yield put({
          type: 'handleReload'
        })
      } else {
        message.error(res.error || res.msg)
      }
    },

    *getStackConfig({
                      payload
                    }, {put, call}){
      const res = yield call(getStackConfig, payload)
      if (res.code === 0) {
        yield put({
          type: 'setStackConfig',
          payload: res.data
        })
      } else {
        message.error(res.error || res.msg)
        yield put({
          type: 'setStackConfig',
          payload: {}
        })
      }
    },

    *updateStackConfig({
                         payload
                       }, {put, call}){
      const res = yield call(updateStackConfig, payload)
      if (res.code === 0) {
        message.success('修改成功!')
        // yield put({
        //   type : 'setStackConfig',
        //   payload : payload.conf
        // })
        yield put({
          type: 'hideDeploymentModal'
        })
      } else {
        message.error(res.error || res.msg)
      }
    },

    *addService({
                  payload
                }, {put, call, select}){
      const res = yield call(updateStackService, payload)
      const {stackId, isFromEditStack} = yield select(state => state["stack/editStack"])
      if (res.code === 0) {
        yield put(routerRedux.push(`/cmdb/component/editStack/${stackId}`))
      } else {
        message.error(res.error || res.msg)
      }
    },

  },
  subscriptions: {
    setup({dispatch, history}){
      history.listen(({pathname}) => {
        const match = pathToRegexp('/cmdb/component/editStack/:id').exec(pathname)
        if (match) {
          if (match[1] === 'addService') {
            dispatch({
              type: 'initAddStackService',
              payload: {
                selectedService: {},
                currentStep: 0
              }
            })
          } else {
            dispatch({
              type: 'getStackTags'
            })
            dispatch({
              type: 'setStackId',
              payload: match[1]
            })
            dispatch({
              type: 'getStackSummary',
              payload: match[1]
            })
          }
        }
      })
    }
  }
}
