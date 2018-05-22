/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-31 14:34 $
 */

import { TimeFilter } from 'utils'
import { graph } from 'services/performance'

export default {
  namespace: 'performance/graphs',
  state: {
    keys: [
      'ping_avg_latency', 'tpsqps', 'cpu_iowait', 'cpu_use_rate', 'memory_use_rate', 'cpu_load', 'mysql_cpu_use_rate',
      'connects', 'sys_io_rate', 'innodb_buffer_hit_rate', 'innodb_row_lock_time',
      'innodb_os_waits', 'net_throughput', 'opened_table', 'get_swap_switch', 'table_locks_waited',
      'create_tmp_table', 'avg_response_timer', 'slow_queries'
    ],
    time:{
      radio: 'last_30_minutes',
      picker: []
    },
  },
  reducers: {
    reload(state, action){
      const { time = 'last_30_minutes' } = action.payload
      return {
        ...state,
        time: TimeFilter.parse(time)
      }
    }
  },
  subscriptions: {
    setup ({ dispatch }) {
      dispatch({   // 让picker显示defaultValue
        type: 'reload',
        payload: {}
      })
    }
  },
}

