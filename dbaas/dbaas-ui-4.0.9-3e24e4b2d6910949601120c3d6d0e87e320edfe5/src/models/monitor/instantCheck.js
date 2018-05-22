/**
 *
 * @copyright(c) 2017
 * @created by lizzy
 * @package dbaas-ui
 * @version :  2017-10-18 14:34 $
 */

import { TimeFilter } from 'utils'
import { graph } from 'services/performance'
import { list as nodeList } from 'services/node'
import { list as instanceList } from 'services/instance'
import { trendTags, getKeys } from 'services/monitor'
import { Modal, message } from 'antd'

export default {
  namespace: 'monitor/instantCheck',
  state: {
    timeRange: {
      '实时': 'last_30_minutes',
      '最近24小时': 'last_24_hours',
      '最近7天': 'last_7_days',
    },
    time:{
      radio: 'last_30_minutes',
      picker: []
    },
    currentNode: '',
    keyword: '',
    nodes: [],
    instances: [],
    mysqlTags: [],
    osTags: [],
    keys: [],
    total: 0,
    currentPage: 1
  },
  reducers: {
    reload(state, action){
      const { time = 'last_30_minutes' } = action.payload
      return {
        ...state,
        time: TimeFilter.parse(time)
      }
    },
    nodeList (state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    instanceList (state, action) {
      return {
        ...state,
        ...action.payload,
      }
    },
    mysqlTags (state, action) {
      return {
        ...state,
        mysqlTags: action.payload,
      }
    },
    osTags (state, action) {
      return {
        ...state,
        osTags: action.payload,
      }
    },
    handleMysqlTags (state, action) {
      state.mysqlTags.forEach((v)=>{
        if (!v.checked) {
          v.checked = false
        }
        if (v.tag === action.payload) {
          v.checked = !v.checked
        }
      })
      return {
        ...state,
        mysqlTags: state.mysqlTags,
      }
    },
    handleOsTags (state, action) {
      state.osTags.forEach((v)=>{
        if (!v.checked) {
          v.checked = false
        }
        if (v.tag === action.payload) {
          v.checked = !v.checked
        }
      })
      return {
        ...state,
        osTags: state.osTags,
      }
    },
    clearMysqlTags (state) {
      state.mysqlTags.forEach((v)=> {
        v.checked = false
      })
      return {
        ...state,
        mysqlTags: state.mysqlTags,
      }
    },
    clearOsTags (state) {
      state.osTags.forEach((v)=> {
        v.checked = false
      })
      return {
        ...state,
        osTags: state.osTags,
      }
    },
    getGraphKeys (state, action) {
      return {
        ...state,
        keys: action.payload,
      }
    },
    getTotal (state, action) {
      return {
        ...state,
        total: action.payload,
      }
    },
    updateCurrentPage (state, action) {
      return {
        ...state,
        currentPage: action.payload,
      }
    },
    updateCurrentNode (state, action) {
      return {
        ...state,
        currentNode: action.payload,
      }
    },
    updateKeyword (state, action) {
      return {
        ...state,
        keyword: action.payload,
      }
    },
  },
  effects: {
    *getNodes ({ payload }, { put, call, select }) {   // 实例
      const { currentNode } = yield select ((state) => { return state['monitor/trend']})
      const res = yield call(nodeList, { ...payload })
      if (res.code === 0) {
        yield put({
          type: 'nodeList',
          payload: {
            nodes: res.data
          }
        })
        if (!currentNode) {  // 第一个node作为初始值
          yield put({
            type: 'updateCurrentNode',
            payload: res.data[0] ? res.data[0]['use'] : ''
          })
        }
      } else {
        message.error(res.error || res.msg)
      }
    },
    *getInstances ({ payload }, { put, call }) {   // 实例组
      const res = yield call(instanceList, {paging:0, fields: 'instance_name,id'}) // 参数格式错误则请求可能不发起也不报错
      if (res.code === 0) {
        yield put({
          type: 'instanceList',
          payload: {
            instances: res.data
          }
        })
      } else {
        message.error(res.error || res.msg)
      }
    },
    *getMysqlTags ({ payload }, { put, call }) {
      const res = yield call(trendTags, {application: 'MySQL'}) // 参数格式错误则请求可能不发起也不报错
      if (res.code === 0) {
        yield put({
          type: 'mysqlTags',
          payload: res.data
        })
      } else {
        message.error(res.error || res.msg)
      }
    },
    *getOsTags ({ payload }, { put, call }) {
      const res = yield call(trendTags, {application: 'OS'})
      if (res.code === 0) {
        yield put({
          type: 'osTags',
          payload: res.data
        })
      } else {
        message.error(res.error || res.msg)
      }
    },
    *getKeys ({ payload }, { put, call, select }) {
      const { keyword, mysqlTags, osTags } = yield select ((state) => { return state['monitor/trend']})
      const selectedMysqlTags = mysqlTags.filter((v)=>{ return v.checked === true }).map((k)=>{ return k.tag })
      const selectedOsTags = osTags.filter((v)=>{ return v.checked === true }).map((k)=>{ return k.tag })
      const tag = selectedMysqlTags.concat(selectedOsTags).join(',')
      const { page = 1 } = payload
      yield put({
        type: 'updateCurrentPage',
        payload: page
      })
      const res = yield call(getKeys, { page, keyword, tag })
      if (res.code === 0) {
        const keys = res.data.data.map((v)=>{
          return v.key
        })
        yield put({
          type: 'getGraphKeys',
          payload: keys
        })
        yield put({
          type: 'getTotal',
          payload: res.data.total
        })
      } else {
        message.error(res.error || res.msg)
      }
    },
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      dispatch({   // 让picker显示defaultValue
        type: 'reload',
        payload: {}
      })

      history.listen(location => {
        if (/graphs/.test(location.pathname)) {
          dispatch({type: 'getNodes',
            payload: {
              instance_id: 'all'
            }
          })
          dispatch({type: 'getInstances'})
          dispatch({type: 'getMysqlTags'})
          dispatch({type: 'getOsTags'})
          dispatch({type: 'getKeys', payload: {}}) // 初始状态获取所有keys
        }
      })
    }
  },
}

