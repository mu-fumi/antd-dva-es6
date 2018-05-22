import { getBusinesses, getStack } from 'services/nodes'
import { Cache } from 'utils'
import queryString from 'query-string'
import pathToRegexp from 'path-to-regexp'

const cache = new Cache()
const cookie = new Cache('cookie')

export default {
  namespace:'accounts',
  state: {
    filter : {
      keywords : '',
      business_id: '',
      relate_id: '',
      relate_type: '',
      application_id: '',
      stack_id: '',
      status: ''
    },
    // stackOptions : {"全部" : ''},
    reload : 0,
    manageType: '',
    businessOptions: [],
    stackOptions: {},
  },
  reducers : {
    handleFilter(state, action){
      return {
        ...state,
        filter : {
          ...state.filter,
          ...action.payload,
        }
      }
    },
    resetFilter(state, action){
      return {
        ...state,
        filter : {
          keywords : '',
          business_id: '',
          relate_id: '',
          relate_type: '',
          application_id: '',
          stack_id: '',
          status: ''
        }
      }
    },
    handleReload(state, action){
      return {
        ...state,
        reload : (+ new Date())
      }
    },
    handleManageType(state, action){
      // console.log(action.payload)
      cache.put('manageType', action.payload)
      return {
        ...state,
        manageType : action.payload,
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
  },
  effects: {

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
        const match = pathToRegexp('/accounts').exec(pathname)
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
