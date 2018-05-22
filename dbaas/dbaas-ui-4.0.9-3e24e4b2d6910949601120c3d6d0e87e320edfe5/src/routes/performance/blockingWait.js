import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Icon } from 'antd'

import { DataTable, Layout, Filter, ProgressIcon, Card } from 'components'
import { constant, TimeFilter, format, radioToPicker } from 'utils'

import styles from './blockingWait.less'

const modelKey = 'performance/blockingWait';
const { SORTER_ORDER, BLOCKING_WAIT } = constant

class BlockingWait extends React.Component {
  componentWillReceiveProps (nextProps) {
    if((this.props.performance.currentNode !== nextProps.performance.currentNode)){
      this.props.dispatch({type: `${modelKey}/getLoadLine`})
      this.props.dispatch({ type: `${modelKey}/handleTableTimeFilter`, payload: {time: 'last_30_minutes'} }) // node和time分别改变，table刷新两次
      this.props.dispatch({type: `${modelKey}/handleDisplayTableTime`})
    }
  }

  render() {
    const { loading, blockingWait, dispatch, performance } = this.props
    const { timeRange, chartData, chartTimeFilter, tableTimeFilter, displayTableTime, blockingWaitSorter } = blockingWait
    const { currentNode } = performance

    const loadLineEffect = `${modelKey}/getLoadLine`

    const handleSorter = (sorter) => {
      dispatch({
        type: `${modelKey}/handleTableSorter`,
        payload:{ blockingWaitSorter: sorter[0] ? sorter : ['blocking_trx_started', 'descend']}
      })
    }

    let filter = {
      hostname: currentNode,
      time: tableTimeFilter.time || tableTimeFilter['radio'] || TimeFilter.toUnix(tableTimeFilter['picker']),
      // 如果有time，则说明是图中点的时间戳，没有则是radio或者picker
    }

    const blockingChartProps = chartData.map((v) => {
      return {
        ...v,
        onEvents: {
          click: (params) => {
            dispatch({
              type: `${modelKey}/handleTableTimeFilter`,
              payload: (+ new Date(params.name))/1000
            })  // 点击图中点仅传值而不是对象
            dispatch({
              type: `${modelKey}/handleDisplayTableTime`,
              payload: TimeFilter.format((+ new Date(params.name))/1000)
            })
          },
        }
      }
    })

    const cardProps = {
      loading: loading,
      radioProps: [{
        buttons: timeRange,
        props:{
          value: chartTimeFilter['radio'],
          onChange: (e) =>{
            dispatch({ type: loadLineEffect, payload:{ time: e.target.value} });
            dispatch({ type: `${modelKey}/handleTableTimeFilter`, payload: {time: e.target.value} })
            dispatch({
              type: `${modelKey}/handleDisplayTableTime`,
              payload: ((radioToPicker(e.target.value)).map((v) => {return TimeFilter.format(v.unix())} )).join(' -- ')
            })
          }
        }
      }],
      pickerProps:[{
        props: {
          // key: +new Date(),
          defaultValue: chartTimeFilter['picker'],
          onOk(value) {
            dispatch({ type: loadLineEffect, payload: { time: TimeFilter.toUnix(value) } });
            dispatch({ type: `${modelKey}/handleTableTimeFilter`, payload: {time: TimeFilter.toUnix(value)} })
            dispatch({
              type: `${modelKey}/handleDisplayTableTime`,
              payload: (value.map((v) => {return TimeFilter.format(v.unix())} )).join(' -- ')
            })
          }
        }
      }],
      chartProps: blockingChartProps,
      tableProps: [
        {
          bordered: true,
          title: () => (
            <div className="card-title">
              <h3 className={styles['tips']}>行锁等待信息表
                <span>
                  时间: {displayTableTime}，
                  当前排序列：{BLOCKING_WAIT[blockingWaitSorter[0]]}，排序方式：{SORTER_ORDER[blockingWaitSorter[1]]}
                </span>
              </h3>
            </div>
          ),
          fetch: {
            url: '/performance/block/list',
            data: filter,
            required: ['hostname']
          },
          columns: [
            { title: '阻塞开始时间', dataIndex: 'blocking_trx_started', key:'blocking_trx_started', sorter: true, width: 160 },
            { title: '锁定的表', dataIndex: 'locked_table', key:'locked_table', sorter: true, width: 150},
            { title: '锁定索引', dataIndex: 'lock_index', key:'lock_index', sorter: true, width: 150},
            { title: '锁定类型', dataIndex: 'lock_type', key:'lock_type', sorter: true, width: 100 },
            { title: '进程 ID', dataIndex: 'waiting_pid', key:'waiting_pid', sorter: true, width: 100 },
            { title: '事务 ID', dataIndex: 'waiting_trx_id', key:'waiting_trx_id', sorter: true, width: 100 },
            { title: '当前 SQL', dataIndex: 'waiting_query', key:'waiting_query', sorter: true, width: 250 },
            { title: '等待时长', dataIndex: 'wait_age', key:'wait_age', sorter: true, width: 100 },
            { title: '等待事务执行时长', dataIndex: 'waiting_trx_age', key:'waiting_trx_age', sorter: true, width: 160 },
            // { title: '查询响应时间指数', dataIndex: 'next_backup_time', key:'next_backup_time', sorter: true },
            { title: '等待事务修改行数', dataIndex: 'waiting_trx_rows_modified', key:'waiting_trx_rows_modified', sorter: true, width: 160 },
            { title: '等待行锁数量', dataIndex: 'waiting_trx_rows_locked', key:'waiting_trx_rows_locked', sorter: true, width: 140 },
            { title: '等待锁类型', dataIndex: 'waiting_lock_mode', key:'waiting_lock_mode', sorter: true, width: 120 },
            { title: '阻塞进程 ID', dataIndex: 'blocking_pid', key:'blocking_pid', sorter: true, width: 120 },
            { title: '阻塞事务 ID', dataIndex: 'blocking_trx_id', key:'blocking_trx_id', sorter: true, width: 100 },
            { title: '阻塞 SQL', dataIndex: 'blocking_query', key:'blocking_query', sorter: true, width: 250 },
            { title: '阻塞事务执行时长', dataIndex: 'blocking_trx_age', key:'blocking_trx_age', sorter: true, width: 150 },
            { title: '阻塞事务修改行数', dataIndex: 'blocking_trx_rows_modified', key:'blocking_trx_rows_modified', sorter: true, width: 150 },
            { title: '阻塞行锁数量', dataIndex: 'blocking_trx_rows_locked', key:'blocking_trx_rows_locked', sorter: true, width: 120},
            { title: '阻塞锁类型', dataIndex: 'blocking_lock_mode', key:'blocking_lock_mode', sorter: true, width: 120 },
          ],
          rowKey: 'id',
          scroll: {x: 3000},
          // reload: tableTimeFilter['reload'],
          handleSorter: handleSorter
        }
      ]
    }

    return (
      <Row>
          <Card {...cardProps} />
      </Row>
    )
  }
}

BlockingWait.propTypes = {
  blockingWait: PropTypes.object,
  loading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=> {
  return {
    loading: state.loading.effects['performance/blockingWait/getLoadLine'],
    blockingWait: state[modelKey],
    performance: state['performance']
  }
})(BlockingWait)
