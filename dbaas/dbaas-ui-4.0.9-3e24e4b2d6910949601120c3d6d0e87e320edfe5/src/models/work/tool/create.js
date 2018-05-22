import { Menu } from 'utils'
import { getToolTags, createTool, startDebugging, executeDebugging, getToolDetail, updateTool} from 'services/tool'
import { message } from 'antd'
import { IconFont } from 'components'
import { update } from 'san-update'
import pathToRegexp from 'path-to-regexp'
import { routerRedux } from 'dva/router'
import createHistory from 'history/createBrowserHistory'

import { Cache } from 'utils'
const cache = new Cache()

export default {
  namespace: 'work/tool/create',
  state: {
    tags: [],
    machineModalVisible: false,
    resultModalVisible: false,
    toolID: null,
    debugResult: {},
    toolDetail: {
      toolName: '',
      newTags: [],
      code: '',
      script: 'shell',
      parameter: '',
      description: '',
    },
    tabProps: {},
    loading: false
  },
  reducers: {
    getTags (state, action) {
      return {
        ...state,
        tags: action.payload
      }
    },
    showMachineModal (state) {
      return {
        ...state,
        machineModalVisible: true
      }
    },
    hideMachineModal (state) {
      return {
        ...state,
        machineModalVisible: false
      }
    },
    showResultModal (state) {
      return {
        ...state,
        resultModalVisible: true
      }
    },
    hideResultModal (state) {
      return {
        ...state,
        resultModalVisible: false
      }
    },
    handleToolID (state, action) {
      return {
        ...state,
        toolID: action.payload
      }
    },
    handleDebugResult (state, action) {
      return {
        ...state,
        debugResult: action.payload
      }
    },
    handleValueChange (state, action) {
      return {
        ...state,
        toolDetail: {
          ...state.toolDetail,
          ...action.payload
        }
      }
    },
    handleProps (state, action) {  // 切换当前tab
      return {
        ...state,
        tabProps: action.payload
      }
    },
    // handleCodeChange (state, action) {
    //   return {
    //     ...state,
    //     toolDetail: {
    //       ...state.toolDetail,
    //       code: action.payload
    //     }
    //   }
    // },
    handleToolDetail (state, action) {
      return {
        ...state,
        toolDetail: {
          ...state.toolDetail,
          ...action.payload
        }
      }
    },
    handleLoading (state, action) {
      return {
        ...state,
        loading: action.payload
      }
    },
  },
  effects: {
    *getToolTags ({
                    payload,
                  }, { call, put }) {
      const res = yield call(getToolTags)
      if (res.code === 0) {
        yield put({
          type: 'getTags',
          payload: res.data || []
        })
      }
    },
    *createTool ({
                   payload
                 }, { call, put }) {
      const res = yield call(createTool, {...payload})
      if (res.code === 0) {
        message.success('新建工具成功')
        yield put(routerRedux.push({
          pathname: '/scripts',
        }))
      } else {
        message.error(res.error || res.msg)
      }
    },
    *startDebugging ({    // 新建和编辑页的调试，此时不需要ID，也不进行记录
                       payload,
                     }, { call, put }) {
      const res = yield call(startDebugging, { ...payload })
      if (res.code === 0) {
        yield put({
          type: 'handleDebugResult',
          payload: res.data
        })
        yield put({
          type: 'handleLoading',
          payload: false
        })
        yield put({
          type: 'showResultModal',
          payload: {
            resultModalVisible: true
          }
        })
      } else {
        message.error(res.error || res.msg)
      }
    },
    *executeDebugging ({    // 执行工具，需要ID并进入历史记录
                         payload,
                       }, { call, put, select }) {
      const { toolID } =  yield select((state) => { return state['work/tool/create']})
      const res = yield call(executeDebugging, { ...payload, id: toolID })
      yield put({
        type: 'handleLoading',
        payload: false
      })
      if (res.code === 0) {
        yield put({
          type: 'handleDebugResult',
          payload: res.data
        })
        yield put({
          type: 'showResultModal',
          payload: {
            resultModalVisible: true
          }
        })
      } else {
        message.error(res.error || res.msg)
      }
    },
    *getToolDetail ({
                      payload
                    }, { call, put }) {
      const id = payload
      const res = yield call(getToolDetail, {id})
      if (res.code === 0) {
        let toolDetail = res.data || {}
        toolDetail.tags = (toolDetail.tags || []).map((v) => {return v.tag_name})
        toolDetail.toolName = toolDetail.tool_name
        toolDetail.script = toolDetail.script_type
        toolDetail.newTags = toolDetail.tags
        yield put({
          type: 'handleToolDetail',
          payload: toolDetail
        })
        cache.put('toolName', toolDetail.toolName)
      } else {
        message.error(res.error || res.msg)
        yield put(routerRedux.push({
          pathname: '/scripts',
        }))
      }
    },
    *updateTool ({
                   payload
                 }, { call, put }) {
      const res = yield call(updateTool, { ...payload })
      if (res.code === 0) {
        message.success('修改成功')
        createHistory().go(-1)
      } else {
        message.error(res.error || res.msg)
      }
    },
  },
  subscriptions: {
    setup ({ dispatch, history }) {

      history.listen(({pathname}) => {
        const toolName = cache.get('toolName')
        if (/scripts(\/)(\d+)(\/)edit/.test(pathname)) {  // 编辑页获取对应id
          const path = pathToRegexp('/scripts/:id(\\d+)/edit').exec(pathname)
          dispatch({
            type: 'getToolDetail',
            payload: path[1]
          })
          dispatch({
            type: 'handleToolID',
            payload: path[1]
          })
          dispatch({
            type: 'handleProps',
            payload: {
              activeKey: '1'
            }
          })
        } else if (/scripts(\/)(\d+)(\/)execute/.test(pathname)) {  // 详情页执行工具页获取对应id
          const path = pathToRegexp('/scripts/:id(\\d+)/execute').exec(pathname)
          dispatch({
            type: 'getToolDetail',
            payload: path[1]
          })
          dispatch({
            type: 'handleToolID',
            payload: path[1]
          })
          dispatch({
            type: 'handleProps',
            payload: {
              activeKey: '1'
            }
          })
        } else {    // 新建页将相关变量置空
          dispatch({
            type: 'handleToolDetail',
            payload: {
              toolName: '',
              newTags: [],
              code: '',
              script: 'shell',
              parameter: '',
              description: '',
            }
          })
          dispatch({
            type: 'handleToolID',
            payload: null
          })
          dispatch({
            type: 'handleProps',
            payload: {
              activeKey: '1'
            }
          })
        }
      })
      dispatch({type: 'getToolTags'})
    }
  },
};
