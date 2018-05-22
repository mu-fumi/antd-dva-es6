/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-15 15:23 $
 */
import { Menu, TimeFilter } from 'utils'
import { explain } from 'services/performance'
import { Modal, message } from 'antd'

export default {
  namespace: 'performance/slowlog',
  state: {
    topFilter:{
      radio: 'last_30_minutes',
      picker: [],
      reload: (+ new Date())
    },
    explainSQL: '',
    explainReload: 0,
    profilingSQL: '',
    fetchTime: '',
    profilingReload: 0,
    slowlogVisible: false
  },
  reducers: {
    handleTopFilter(state, action){
      const { time = 'last_30_minutes' } = action.payload

      return {
        ...state,
        topFilter: {
          reload: (+ new Date()),
          ...TimeFilter.parse(time)
        }
      }
    },
    handleExplain(state, action){
      const { explainSQL } = action.payload
      return {
        ...state,
        explainSQL: explainSQL,
        explainReload: (+ new Date()),
      }
    },
    handleProfiling(state, action){
      const { profilingSQL, fetchTime } = action.payload
      return {
        ...state,
        profilingSQL: profilingSQL,
        fetchTime: fetchTime,
        profilingReload: (+ new Date()),
      }
    },
    showSlowlogModal(state){
      return {
        ...state,
        slowlogVisible: true
      }
    },
    hideSlowlogModal(state){
      return {
        ...state,
        slowlogVisible: false
      }
    },
  },
  effects: {
  },
  subscriptions: {
    setup ({ dispatch }) {
      dispatch({   // 让picker显示defaultValue
        type: 'handleTopFilter',
        payload: {}
      })
    }
  },
};
