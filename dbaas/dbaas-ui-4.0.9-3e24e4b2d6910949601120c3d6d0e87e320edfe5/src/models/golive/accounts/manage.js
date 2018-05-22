
import { submit } from 'services/accounts'
import { message } from 'antd'
import { routerRedux } from 'dva/router'
import { Cache } from 'utils'
import _ from 'lodash'

const cache = new Cache()

const initialState = {
  currentStep: 0,
  accountName: '',
  grantDb: {},
  accountPassword: '',
  accountPasswordConfirmation: '',
  accountRemark: '',
  keys: [0],
  databases: ['*'],
  permissions: [],
  selectedDatabases: []
}

export default {
  namespace: 'accounts/manage',
  state: initialState,
  reducers: {
    resetState(state, action){
      // console.log(state, initialState)
      return {
        currentStep: 0,
        accountName: '',
        grantDb: {},
        accountPassword: '',
        accountPasswordConfirmation: '',
        accountRemark: '',
        keys: [0],
        databases: ['*'],
        permissions: [],
        selectedDatabases: []
      }
    },
    handleCurrentStep(state, action){
      return {
        ...state,
        currentStep: action.payload
      }
    },
    plusCurrentStep(state, action){
      return {
        ...state,
        currentStep: state.currentStep + 1
      }
    },

    minusCurrentStep(state, action){
      return {
        ...state,
        currentStep: state.currentStep - 1
      }
    },
    setFormData(state, action){
      return {
        ...state,
        ...action.payload
      }
    },
    setSelectedDatabases(state, action){
      return {
        ...state,
        selectedDatabases: action.payload
      }
    },
  },
  effects: {
    *handleSubmit({payload}, {put, call, select}) {
      const { accountName, accountPassword, accountPasswordConfirmation, accountRemark, databases,
        permissions, selectedDatabases } = yield select(state => state['accounts/manage'])
      const manageType = cache.get('manageType')
      let grantDb = {}
      databases.forEach((v, index) => grantDb[v] = permissions[index])
      let params = {'action_type': manageType, 'account_name': accountName, 'account_remark': accountRemark,
        'database': selectedDatabases.map(v=> {return {'relate_id': v.id, 'relate_type': v.relate_type}})}
      if (manageType === 1 || manageType === 4 || manageType === 5) {
        params['grant_db'] = grantDb
      }
      if (manageType === 1) {
        params['account_password'] = accountPassword
        params['account_password_confirmation'] = accountPasswordConfirmation
      }
      if (manageType === 3) {
        params['new_password'] = accountPassword
        params['new_password_confirmation'] = accountPasswordConfirmation
      }
      // console.log(params)
      const res = yield call(submit, params)
      if (res && res.code === 0) {
        message.success('操作成功')
        yield put(
          routerRedux.push('/accounts')
        )
      } else {
        res && message.error(res.error || res.msg)
      }
    }
  },
  subscription: {
    setup({dispatch}){


    }
  }
}
