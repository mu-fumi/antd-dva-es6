/**
 * Created by zhangmm on 2017/7/3.
 */
export default {
  namespace:'package/list',
  state:{
    placeholder : '根据关键词搜索程序包',
    keyword : '',
    reload:(+ new Date())
  },
  reducers:{
    handleFilter (state , action) {
      return {
        ...state,
        keyword:action.payload.keyword
      }
    },
    handleReload:(state) => {
      return {
        ...state,
        reload:(+ new Date())
      }
    },
    handleKeyword (state , action) {
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
  },
  effects:{},
  subscriptions:{}
}
