/**
 * Created by wengyian on 2018/2/26.
 */
import { uploadQuorum } from 'services/quorumCluster'
import { message } from 'antd'
import pathToRegexp from 'path-to-regexp'
import _ from 'lodash'
import { constant } from 'utils'
import queryString from 'query-string'

export default {
  namespace: 'quorumCluster',
  state: {
    filter: {
      keywords: '',
      type: '',
      status: '',
    },
    file: '',
    reload: (+ new Date()),
    showAllIP: {},
    importModalVisible: false,
    modalKey: (+ new Date())
  },
  reducers: {
    handleFilter (state, action) {
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload
        }
      }
    },

    resetFilter (state, action) {
      return {
        ...state,
        filter: {
          keywords: '',
          type: '',
          status: '',
        }
      }
    },

    handleReload (state, action) {
      return {
        ...state,
        reload: (+ new Date())
      }
    },

    handleModalKey (state, action) {
      return {
        ...state,
        modalKey: (+ new Date())
      }
    },

    handleImpModalVisible (state, action) {
      return {
        ...state,
        importModalVisible: action.payload
      }
    },

    handleFile (state, action) {
      return {
        ...state,
        file: action.payload
      }
    },

    handleShowAllIP (state, action) {
      const {isShow, id} = action.payload
      const oldShowAllIP = state.showAllIP
      if (isShow) {
        oldShowAllIP[id] = true
      } else {
        Reflect.deleteProperty(oldShowAllIP, id)
      }
      return {
        ...state,
        showAllIP: {...oldShowAllIP}
      }
    },
  },
  effects: {
    *importQuorum ({
      payload
    }, {call, put}) {
      let res =  yield call(uploadQuorum, payload)
      if (res.code === 0) {
        yield put({
          type: 'handleImpModalVisible',
          payload: false
        })
        yield put({
          type: 'handleReload'
        })
        yield put({
          type: 'handleFile',
          payload: ''
        })
        yield put({
          type: 'handleModalKey'
        })
        message.success('批量导入仲裁集群配置成功')
      } else {
        message.error(res.msg || res.err)
      }
    }
  },
  subscriptions: {}
}
