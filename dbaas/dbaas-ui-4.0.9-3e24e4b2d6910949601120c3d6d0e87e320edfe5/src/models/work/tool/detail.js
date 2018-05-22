import { Menu, TimeFilter } from 'utils'
import { getToolDetail, deleteTool, updateTool } from 'services/tool'
import { Modal, message, Col, Row } from 'antd'
import { IconFont } from 'components'
import { routerRedux, Link } from 'dva/router'
import {update} from 'san-update'
import pathToRegexp from 'path-to-regexp'

import { Cache } from 'utils'
const cache = new Cache()

export default {
  namespace: 'work/tool/detail',
  state: {
    toolDetail: {
      tool_name: '',
      tags: [],
      icon: '',
      icon_bg_color: '',
      script_type: 'shell',
      description: '',
      code: '',
      editor: ''
    },
    timeRange: {
      '近24小时': 'last_1_days',
      '近7天': 'last_7_days',
      '近30天': 'last_30_days',
    },
    tableFilter: {
      radio: 'last_1_days',
      picker: []
    },
    ID: null,
    iconModalVisible: false,
    selectedColor: '',
    selectedIcon: ''
  },
  reducers: {
    handleToolDetail (state, action) {
      return {
        ...state,
        toolDetail: action.payload
      }
    },
    handleTableFilter (state, action) {
      return {
        ...state,
        tableFilter: {
          ...state.tableFilter,
          ...TimeFilter.parse(action.payload)
        }
      }
    },
    handleID (state, action) {
      return {
        ...state,
        ID: action.payload
      }
    },
    showIconModal (state) {
      return {
        ...state,
        iconModalVisible: true
      }
    },
    hideIconModal (state) {
      return {
        ...state,
        iconModalVisible: false
      }
    },
    selectColor (state, action) {
      return {
        ...state,
        selectedColor: action.payload
      }
    },
    selectIcon (state, action) {
      return {
        ...state,
        selectedIcon: action.payload
      }
    },
    updateIconColor (state, action) {
      return {
        ...state,
        toolDetail: {
          ...state.toolDetail,
          ...action.payload
        }
      }
    },
  },
  effects: {
     *getToolDetail ({
      payload
      }, { call, put }) {
       const id = payload
       const res = yield call(getToolDetail, {id})
       if (res.code === 0) {
          res.data = res.data || {}
          res.data.tags =(res.data.tags || []).map((v) => {return v.tag_name}).join(', ')
          yield put({
            type: 'handleToolDetail',
            payload: res.data
          })
         cache.put('toolName', res.data.tool_name)
       } else {
        message.error(res.error || res.msg)
         yield put(routerRedux.push({
           pathname: '/scripts',
         }))
       }
     },
    *deleteTool ({
       payload
      }, { call, put }) {
      const res = yield call(deleteTool, { ...payload })
      if (res.code === 0) {
        message.success('删除成功')
        yield put(routerRedux.push({
          pathname: '/scripts',
        }))
      } else {
        message.error(res.error || res.msg)
      }
    },
    *changeIcon ({
       payload
     }, { call, put, select }) {
      const { selectedIcon, selectedColor, ID } =  yield select((state) => { return state['work/tool/detail']})
      const res = yield call(updateTool, { icon: selectedIcon, icon_bg_color: selectedColor, id: ID })
      if (res.code === 0) {
        yield put({
          type: 'updateIconColor',
          payload: {
            icon: selectedIcon,
            icon_bg_color: selectedColor
          }
        })
        message.success('修改成功')
      } else {
        message.error(res.error || res.msg)
      }
    },
  },
  subscriptions: {
    setup ({ dispatch, history }) {
      history.listen(({pathname}) => {
        if (/scripts(\/)(\d+)$/.test(pathname)) {
          const path = pathToRegexp('/scripts/:id(\\d+)').exec(pathname)
          const ID = path[1]
          dispatch({
            type: 'getToolDetail',
            payload: ID
          })
          dispatch({
            type: 'handleID',
            payload: ID
          })
        }
      })
    }
  },
};
