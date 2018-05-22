import { Menu } from 'utils'
import { list as nodeList } from 'services/node'
import { getSetting, updateSetting, getInterfaceSetting, updateInterfaceSetting } from 'services/performance'
import { Modal, message } from 'antd'
import {update} from 'san-update'

import { Cache } from 'utils'
const cache = new Cache()

export default {
  namespace: 'performance',
  state: {
    nodes: {},
    currentNode: cache.get('currentNode') || '',
    settingVisible: false,
    settingData: { enable: true },
    interfaceSettingVisible: false,
    interfaceSettingData: {},
    timeRange: {
      '实时': 'last_30_minutes',
      '最近24小时': 'last_24_hours',
      '最近7天': 'last_7_days',
    },
  },
  reducers: {
    nodeList (state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    handleSelectNode (state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    setSetting (state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    showSettingModal (state) {
      return {
        ...state,
        settingVisible: true
      }
    },
    hideSettingModal (state) {
      return {
        ...state,
        settingVisible: false,
      }
    },
    showInterfaceSettingModal (state) {
      return {
        ...state,
        interfaceSettingVisible: true
      }
    },
    hideInterfaceSettingModal (state) {
      return {
        ...state,
        interfaceSettingVisible: false,
      }
    },
    setInterfaceSetting (state, action) {
      return {
        ...state,
        ...action.payload,
      }
    }
  },
  effects: {
    *getNodes ({ payload }, { put, call }) {
      const res = yield call(nodeList, {isFull: 1})
      if (res.code === 0) {
        let nodes = {}
        for (let k in res.data) {
          if (!res.data.hasOwnProperty(k)) {
            break
          }
          if (k.toLowerCase().indexOf('mysql') >= 0) {
            nodes = res.data[k]
            break
          }
        }
        const defaultCurrentNode = Object.keys(nodes)[0] || ''
        yield put({
          type: 'nodeList',
          payload: {
            nodes: nodes
          }
        })
        const currentNode = cache.get('currentNode')   // 刷新页面从localstorage中读取currentNode

        yield put({
          type: 'handleSelectChange',
          payload: {
            currentNode: currentNode || defaultCurrentNode
          }
        })
        if (!currentNode) {
          cache.put('currentNode', defaultCurrentNode)
        }
        // console.log(currentNode)
      } else {
        message.error(res.error || res.msg)
      }
    },
    *handleSelectChange({ payload }, { put }) {
      yield put({
        type: 'handleSelectNode',
        payload: {
          currentNode: payload.currentNode
        }
      })
      yield put({type: 'getSetting'})

      cache.put('currentNode', payload.currentNode)
    },

    *getSetting ({ payload }, { put, call, select }) {
      const { currentNode } = yield select((state) => {
        return state['performance']
      })

      if (!currentNode) {
        return false
      }
      const res = yield call(getSetting, {node: currentNode})
      if (res.code === 0) {
        yield put({
          type: 'setSetting',
          payload: {
            settingData: res.data
          }
        })
      } else {
        message.error(res.error || res.msg)
      }
    },
    *saveSetting ({ payload }, { put, call, select }) {
      const { currentNode, settingData } = yield select((state) => {
        return state['performance']
      })

      let updating = {}
      payload['using_nic'] = {}
      payload['using_nic'][payload.nic] = payload.bandwidth
      Object.keys(payload).map((v)=>{
        if(v in settingData){
          updating[v] = {$set: payload[v]}
        }else{
          if(settingData.module && (v in settingData.module)){
            updating['module'] = updating['module'] || {}
            updating['module'][v] = updating['module'][v] || {}
            updating['module'][v]['value'] = {$set: payload[v]}
          }
        }
      })

      let newSettingData = update(settingData, updating)

      yield put({
        type: 'setSetting',
        payload: { settingData: newSettingData }
      })
      if (!currentNode) {
        return false
      }
      const res = yield call(updateSetting, {hostname: currentNode, ...payload})
      if (res.code === 0) {
        yield put({
          type: 'hideSettingModal'
        })
        Modal.success({
          title: '配置成功',
          content: <p>当前节点性能分析配置成功</p>,
        })

        yield put({
          type : 'getSetting'
        })

      } else {
        yield put({
          type: 'hideSettingModal'
        })
        Modal.error({
          title: '配置失败',
          content: <p>{res.error || res.msg}</p>,
        })
        yield put({
          type: 'setSetting',
          payload: { settingData }
        })
      }
    },
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen(location => {
        if (/performance([(\/)A-Za-z0-9_\\-]?)/.test(location.pathname)) {
          dispatch({type: 'getNodes'})
        }
      })
    }
  },
};
