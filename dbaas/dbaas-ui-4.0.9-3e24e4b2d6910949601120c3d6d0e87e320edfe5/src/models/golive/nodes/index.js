/**
 * Created by wengyian on 2017/9/8.
 */

import {
  deleteNode, switchStatus, upNode, downNode,
  getBusinesses, getStack,
} from 'services/nodes'
import {message, Modal, Row} from 'antd'
import {Cache} from 'utils'
import queryString from 'query-string'
import pathToRegexp from 'path-to-regexp'

const cookie = new Cache('cookie')

export default {
  namespace: 'nodes',
  state: {
    reload: 0,
    filter: {
      keywords: '',
      alive: '',
      business_id: '',
      relate_id: '',
      relate_type: '',
      application_id: '',
      stack_id: ''
    },
    businessOptions: [],
    stackOptions: {},
    tipModalVisible: false,
    force: false,
    taskType: 0, //0 : ''  1: 启动  2：删除  3：下线  4：增加
    spinning : false,
    upModalVisible : false,
    upId : -1,
  },
  reducers: {
    handleKeywords(state, action){
      return {
        ...state,
        filter : {
          ...state.filter,
          keywords : action.payload
        }
      }
    },
    handleReload(state, action){
      return {
        ...state,
        reload: +new Date()
      }
    },

    handleFilter(state, action){
      return {
        ...state,
        filter: {
          ...state.filter,
          ...action.payload
        }
      }
    },

    setForce(state, action){
      return {
        ...state,
        force: action.payload
      }
    },

    initFilter(state, aciton){
      return {
        ...state,
        filter: {
          keywords: '',
          alive: '',
          business_id : '',
          relate_id : '',
          relate_type : '',
          application_id : '',
          stack_id : ''
        }
      }
    },

    toggleTipModalVisible(state, action){
      if (state.tipModalVisible === false) {
        return {
          ...state,
          tipModalVisible: !state.tipModalVisible
        }
      } else {
        return {
          ...state,
          taskType: 0,
          tipModalVisible: !state.tipModalVisible
        }
      }
    },

    setUpModalVisible(state, action){
      return {
        ...state,
        upModalVisible : action.payload
      }
    },

    setUpId(state, action){
      return {
        ...state,
        upId : action.payload
      }
    },

    setBusinessOptions(state, action){
      const data = action.payload
      const businessOptions = data.map(v => {
        return {
          label: v.name,
          value: v.id,
          isLeaf: false
        }
      })
      return {
        ...state,
        businessOptions,
      }
    },

    setStackOptions(state, action){
      const data = action.payload
      let stack = {}
      data.forEach(v => {
        stack[v.name] = v.id
      })

      return {
        ...state,
        stackOptions: stack
      }
    },

    // 清空 filter 中url 带过来的参数
    clearQuery(state, action){
      // todo  需要加入 可初始化白名单，名单外删除
      // todo 名单内的 为想好如何处理
      const allowFilter = ['keywords', 'alive', 'relate_id', 'relate_type', 'application_id', 'stack_id']
      const query = action.payload
      let {filter} = state
      Object.keys(query).forEach(key => {
        if (!allowFilter.includes(key)) {
          delete filter[key]
        }
      })
      return {
        ...state,
        filter: {...filter}
      }
    },

    setTaskType(state, action){
      return {
        ...state,
        taskType : action.payload
      }
    },

    setSpinning(state, action){
      return {
        ...state,
        spinning : action.payload
      }
    },
  },
  effects: {
    *deleteNode({
                  payload
                }, {put, call}){
      const res = yield call(deleteNode, payload)
      if (res.code === 0) {
        // yield put({
        //   type : 'handleReload'
        // })
        yield put({
          type : 'setTaskType',
          payload : 2
        })
        yield put({
          type: 'toggleTipModalVisible'
        })
        yield put({
          type: 'setForce',
          payload: false
        })
      } else {
        message.error(res.msg || res.error)
      }
    },

    *upNode({
              payload
            }, {put, call}){
      const res = yield call(upNode, payload)
      if (res.code === 0) {
        // yield put({
        //   type : 'handleReload'
        // })
        yield put({
          type : 'setTaskType',
          payload : 1
        })
        yield put({
          type: 'toggleTipModalVisible'
        })
      }else if(res.code === 1201){
        yield put({
          type : 'setUpModalVisible',
          payload : true
        })
      }else if(res.code === 3001){
        message.success('节点启动成功')
        yield put({
          type: 'handleReload'
        })
      } else {
        message.error(res.msg || res.error)
      }
      yield put({
        type : 'setSpinning',
        payload : false
      })
    },

    *downNode({
                payload
              }, {put, call}){
      const res = yield call(downNode, payload)
      if (res.code === 0) {
        message.success('节点停止成功')
        yield put({
          type: 'handleReload'
        })
      } else {
        message.error(res.msg || res.error)
      }
      yield put({
        type : 'setSpinning',
        payload : false
      })
    },


    // *switchStatus({
    //   payload
    // }, { put, call }){
    //   const { id, status } =  payload
    //   let res = {}
    //   if(status === 0){
    //     res = yield call(downNode, id)
    //   }else{
    //     res = yield call(upNode, id)
    //   }
    //   // const res = yield call(switchStatus, payload)
    //   if(res.code === 0){
    //     yield put({
    //       type : 'handleReload'
    //     })
    //   }else{
    //     message.error(res.msg || res.error)
    //   }
    // },

    *getBusinesses({
                     payload
                   }, {put, call}){
      let res = yield call(getBusinesses, payload)
      if (res.code === 0) {
        yield put({
          type: 'setBusinessOptions',
          payload: res.data
        })
      } else {
        message.error(res.msg || res.error)
      }
    },

    *getStack({
                payload
              }, {put, call}){
      let res = yield call(getStack, payload)
      if (res.code === 0) {
        yield put({
          type: 'setStackOptions',
          payload: res.data
        })
      } else {
        message.error(res.msg || res.error)
      }
    },

  },
  subscriptions: {
    setup({dispatch, history}){
      // todo 监听页面路由 获取参数 然后写进 筛选项
      history.listen(({pathname, search}) => {
        if(history.action === 'REPLACE'){
          return
        }
        const match = pathToRegexp('/nodes').exec(pathname)
        if(match){
          const query = queryString.parse(search)
          const {...filter} = query
          dispatch({
            type: 'handleFilter',
            payload: filter
          })

          const user_id = cookie.get('uid')
          dispatch({
            type: 'getBusinesses',
            payload: {
              user_id: user_id,
            }
          })

          dispatch({
            type: 'getStack',
            payload: {
              paginate: 0
            }
          })
        }
      })
    }
  }
}
