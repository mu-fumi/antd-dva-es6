/**
 * Created by wengyian on 2017/9/4.
 */

export default {
  namespace : 'offline',
  state : {
    filter : {
      keyword : '',
      time : '',
    },
    reload : 0
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

    initFilter(state, action){
      return {
        ...state,
        filter : {
          keyword : '',
          time : '',
        }
      }
    },

    handleReload(state, action){
      return {
        ...state,
        reload : (+ new Date())
      }
    }
  },
  effects : {

  },
  subscriptions : {
    setup({dispatch, history}){

    }
  }
}
