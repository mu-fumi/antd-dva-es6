/**
 * Created by zhangmm on 2017/9/1.
 */

export default {
  namespace:'logs',
  state:{
    placeholder : '根据用户名、日志搜索',
    keyword : '',
    reload:(+ new Date())
  },
  reducers:{
    handleReload:(state) => {
      return {
        ...state,
        reload:(+ new Date())
      }
    },
    handleFilter (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
    resetFilter(state) {
      return {
        ...state,
        keyword : ''
      }
    },
    handleKeyword (state , action) {
      return {
        ...state,
        ...action.payload
      }
    },
  },

  effects:{

  },
  subscriptions:{
  }
}
