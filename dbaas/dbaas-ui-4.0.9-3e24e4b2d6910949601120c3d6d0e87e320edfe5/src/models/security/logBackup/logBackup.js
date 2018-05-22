/**
 * Created by lulu on 2018/4/18.
 */
export default {
  namespace:'logBackup',
  state:{
    placeholder : '搜索 实例',
    keyword : '',
    reload:(+ new Date()),
    pickerDefaultValue: [],  // picker的defaultValue，便于跳转别的页面然后从别的页面返回本页时保留筛选条件
    publishRange: [],
    currentPage: 1,
    instances: [],
    node: '',
  },
  reducers: {
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
    handlePublishRange (state, action) {
      return {
        ...state,
        publishRange : action.payload
      }
    },
    handlePickerDefaultValue (state, action) {
      return {
        ...state,
        pickerDefaultValue: action.payload
      }
    },
    setCurrentPage (state, action) {
      return {
        ...state,
        currentPage: action.payload
      }
    },
    setCurrentPage (state, action) {
      return {
        ...state,
        currentPage: action.payload
      }
    },
    handleNode (state, action) {
      return {
        ...state,
        node : action.payload
      }
    },
  },
  effects:{

  },
  subscriptions:{
  }
}
