/**
 * Created by wengyian on 2017/7/20.
 */

import { createService, getServiceInfo } from 'services/stack'
import { message } from 'antd'
import { routerRedux } from 'dva/router'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace : 'stack/createService',
  state : {
    currentStep : 0, //当前步数
    serviceInfo : {}, // 服务信息
    selectedPackage : -1, //选择包的 id
    selectedPackageVersion : -1, //选择包版本的 id
    // isCreate: true,// 是否新建
    serviceId : -1, //服务的id,
    isFromAddStack : false, //是否从新建套件跳转过来
  },
  reducers : {
    plusCurrentStep(state, action){
      return {
        ...state,
        currentStep : state.currentStep + 1
      }
    },

    minusCurrentStep(state, action){
      return {
        ...state,
        currentStep : state.currentStep - 1
      }
    },

    setCurrentStep(state, action){
      return {
        ...state,
        currentStep : action.payload
      }
    },

    saveServiceInfo(state, action){
      return {
        ...state,
        serviceInfo : action.payload
      }
    },

    saveSelectedPackage(state, action){
      return {
        ...state,
        selectedPackage : action.payload
      }
    },

    saveSelectedPackageVersion(state, action){
      return {
        ...state,
        selectedPackageVersion : action.payload
      }
    },

    setIsCreate(state, action){
      return {
        ...state,
        isCreate : action.payload
      }
    },

    setServiceId(state, action){
      return {
        ...state,
        serviceId : action.payload
      }
    },

    setIsFromAddStack(state, action){
      return {
        ...state,
        isFromAddStack : action.payload
      }
    },

    setIsFromAddStackService(state, action){
      return {
        ...state,
        isFromAddStackService : action.payload
      }
    },

    initCreateService(state, action){
      return {
        ...state,
        ...action.payload
      }
    }

  },
  effects : {
    *createService({
      payload
    }, { put, call, select }){
      const { isFromAddStack, isFromAddStackService} = yield select( state => state['stack/createService'])
      const res = yield call(createService, payload)
      if(res.code === 0){
        message.success('新建成功')
        if(isFromAddStack){//从新建套件过来的
          yield put(routerRedux.push('/cmdb/component/addStack?from=2'))
        }else if(isFromAddStackService){
          yield put(routerRedux.push('/cmdb/component/editStack/addService'))
        }else{
          yield put(routerRedux.push('/cmdb/component/service-view'))
        }
      }else{
        message.error( res.error || res.msg )
      }
    },

  },
  subscriptions : {
    setup({ dispatch, history }){
      history.listen(({pathname}) => {
        const match = pathToRegexp('/cmdb/component/createService').exec(pathname)
        if(match){
          dispatch({
            type : 'setIsFromAddStack',
            payload : false
          })
          dispatch({
            type : 'setIsFromAddStackService',
            payload : false
          })
          let url = location.search
          if(url.includes('from=1')){//表示从新建包处回来
            // dispatch({
            //   type : 'setCurrentStep',
            //   payload : 1
            // })
            dispatch({
              type : 'initCreateService',
              payload : {
                selectedPackage : -1,
                selectedPackageVersion : -1,
                currentStep : 1,
              }
            })
          }else{
            dispatch({
              type : 'initCreateService',
              payload : {
                selectedPackage : -1,
                selectedPackageVersion : -1,
                currentStep : 0,
                serviceInfo : {}
              }
            })
            if(url.includes('from=2')){//表示从新建套件过来
              dispatch({
                type : 'setIsFromAddStack',
                payload : true
              })
              // dispatch({
              //   type : 'initCreateService',
              //   payload : {
              //     selectedPackage : -1,
              //     selectedPackageVersion : -1,
              //     currentStep : 0,
              //     serviceInfo : {}
              //   }
              // })
            }else if(url.includes('from=4')){//表示从编辑套件的新增服务过来的
              dispatch({
                type : 'setIsFromAddStackService',
                payload : true
              })
              // dispatch({
              //   type : 'initCreateService',
              //   payload : {
              //     selectedPackage : -1,
              //     selectedPackageVersion : -1,
              //     currentStep : 0,
              //     serviceInfo : {}
              //   }
              // })
            }
          }
        }
      })
    }

  }
}
