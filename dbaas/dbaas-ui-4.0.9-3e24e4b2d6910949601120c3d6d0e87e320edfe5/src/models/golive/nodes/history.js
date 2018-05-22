import {getStack,getBusinesses} from 'services/nodes'
import pathToRegexp from 'path-to-regexp'
import {Cache} from 'utils'
const cookie = new Cache('cookie')

export default {
  namespace : 'history',
  state : {
    filter : {
      keyword : '',
      time: '',
      stack_id: '', //套件ID
      relate_id: '',
      relate_type: '',
      application_id: '',
      app_id: '',
      state: '',
    },
    pickerDefaultValue: [],  //picker的defaultValue，便于跳转别的页面然后从别的页面返回本页时保留筛选条件
    reload : 0,
    stackOptions:{}, //所属套件
    businessOptions: [],
  },
  reducers : {
    handleFilter(state, action){
      return {
        ...state,
        filter : {
          ...state.filter,
          ...action.payload
        }
      }
    },
    handleResetFilter(state, action){
      return {
        ...state,
        filter: {
          keyword: '',
          time: '',
          stack_id: '',
          relate_id: '',
          relate_type: '',
          application_id: '',
          app_id: '',
          state: '',
        }
      }
    },
    handlePickerDefaultValue (state, action) {
      return {
        ...state,
        pickerDefaultValue: action.payload
      }
    },
    initFilter(state, action){
      return {
        ...state,
        filter : {
          keyword : '',
          time: '',
          stack_id: '',
          relate_id: '',
          relate_type: '',
          application_id: '',
          app_id: '',
          state: '',
        }
      }
    },

    handleReload(state, action){
      return {
        ...state,
        reload : (+ new Date())
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

  },
  effects : {
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
  },
  subscriptions : {
    setup({dispatch, history}){
      // 监听路由
      history.listen(({pathname, search}) => {
        if(history.action === 'REPLACE'){
          return
        }
        const match = pathToRegexp('/nodes/history').exec(pathname)
        if(match) {
          // 获取所属套件
          dispatch({
            type: 'getStack',
            payload: {
              paginate: 0
            }
          })
          // 获取所属
          const user_id = cookie.get('uid')
          dispatch({
            type: 'getBusinesses',
            payload: {
              user_id: user_id,
            }
          })
        }
      })
    }

  }
}
