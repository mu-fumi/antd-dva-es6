/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-15 10:53 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row } from 'antd'
import { Layout, Filter, ProgressIcon, Card } from 'components'
import { Link } from 'dva/router'
import { constant, TimeFilter } from 'utils'

import ProcessList from './processlist'
import ProcessListModal from './processlistModal'

const model = 'performance/session'

class Session extends React.Component {

  componentWillReceiveProps (nextProps) {
    if(this.props.performance.currentNode !== nextProps.performance.currentNode){
      this.props.dispatch({type: `${model}/getSessionLine`})
      this.props.dispatch({type: `${model}/getWaitLine`})
      //this.props.dispatch({type: `${model}/getWaitTable`})
    }
  }

  render() {
    const { sessionLineLoading, waitLineLoading, session, dispatch, performance } = this.props
    const {  sessionLine, waitLine, sessionFilter, waitFilter, waitTableTime, processList, processListVisible } = session
    const { currentNode, timeRange } = performance

    const sessionLineEffect = `${model}/getSessionLine`
    const sessionLineCard = {
      loading: sessionLineLoading,
      radioProps: [{
        buttons: timeRange,
        props: {
          value: sessionFilter['radio'],
          onChange: (e) => {
            dispatch({type: sessionLineEffect, payload: {time: e.target.value}})
          }
        }
      }],
      pickerProps: [{
        props: {
          // key: +new Date(),
          defaultValue: sessionFilter['picker'],
          onOk(value) {
            dispatch({
              type: sessionLineEffect,
              payload: {time: TimeFilter.toUnix(value)},
            })
          }
        }
      }],
      chartProps: sessionLine,
    }

    const waitLineEffect = `${model}/getWaitLine`
    const waitTableEffect = `${model}/getWaitTable`

    const waitChartProps = waitLine.map((v) => {
      return {
        ...v,
        onEvents: {
          click: (params) => {
            dispatch({type: waitTableEffect, payload: {time: (+ new Date(params.name))/1000, currentNode}})
          },
        }
      }
    })

    const onShow = (e) =>{
      e.preventDefault()
      dispatch({ type: `${model}/showProcesslistModal`, payload: { time: waitTableTime }})
    }

    const processListModalProps = {
      visible: processListVisible,
      node: currentNode,
      time: waitTableTime,
      onOk: () =>{
        dispatch({ type: `${model}/hideProcesslistModal`})
      },
      onCancel: ()=>{
        dispatch({ type: `${model}/hideProcesslistModal`})
      },
    }

    const waitLineCard = {
      loading: waitLineLoading,
      radioProps: [{
        buttons: timeRange,
        props: {
          value: waitFilter['radio'],
          onChange: (e) => {
            dispatch({type: waitLineEffect, payload: {time: e.target.value}})
            dispatch({type: waitTableEffect})
          }
        }
      }],
      pickerProps: [{
        props: {
          // key: +new Date(),
          defaultValue: waitFilter['picker'],
          onOk(value) {
            dispatch({
              type: waitLineEffect,
              payload: {time: TimeFilter.toUnix(value)},
            })
            dispatch({type: waitTableEffect})
          }
        }
      }],
      chartProps: waitChartProps,
      tableProps: [
        {
          span: 24,
          title: () => (
            <div className="card-title">
              <h3>长时间未提交事务列表
                <span>时间点: {TimeFilter.format(waitTableTime)}</span>
              </h3>
            </div>
          ),
          size: "small",
          bordered: true,
          fetch: {
            url: '/performance/session/uncommit',
            data: { hostname: currentNode, time: waitTableTime},
            required: ['hostname']
          },
          columns: [
            {title: '线程 ID', dataIndex: 'trx_mysql_thread_id'},
            {title: '事务 ID', dataIndex: 'trx_id'},
            {title: '事务开始时间', dataIndex: 'trx_started'},
            {title: '事务总执行时间(s)', dataIndex: 'total_exec_time_s'},
            {title: '事务未提交时间(s)', dataIndex: 'uncommit_time_s'},
          ],
          rowKey: 'id',
          // pagination: false,
          scroll: {x: 800},
        }, {
          span: 24,
          title: () => (
            <div className="card-title">
              <h3>执行时间过长SQL列表<span>时间点: {TimeFilter.format(waitTableTime)}</span></h3>
            </div>
          ),
          size: "small",
          bordered: true,
          fetch: {
            url: '/performance/session/execute',
            data: { hostname: currentNode, time: waitTableTime},
            required: ['hostname']
          },
          columns: [
            {title: '线程 ID', dataIndex: 'trx_mysql_thread_id', width : 100},
            {title: '用户', dataIndex: 'user', width : 120},
            {title: '客户端', dataIndex: 'host', width : 140},
            {title: 'Database', dataIndex: 'db', width : 100},
            {title: '指令', dataIndex: 'command'},
            {title: '耗时 (s)', dataIndex: 'time', width : 80},
            {title: '状态', dataIndex: 'state'},
            {title: 'SQL 信息', dataIndex: 'info'},
          ],
          rowKey: 'id',
          // pagination: false,
          scroll: {x: 1040},
        }, {
          span: 24,
          title: () =>  (
            <div className="card-title">
              <h3 className="inline-block">等待行锁过长事务列表<span>时间点: {TimeFilter.format(waitTableTime)}</span></h3>
              <Link target="_blank" className="pull-right"
                    to={`/performance/lock-wait?time=${waitFilter['radio'] || TimeFilter.toUnix(waitFilter['picker'])
                       }&point=${waitTableTime}&sorter=wait_age`}>
                查看更多
              </Link>
            </div>
          ),
          size: "small",
          bordered: true,
          fetch: {
            url: '/performance/session/lock',
            data: { hostname: currentNode, time: waitTableTime},
            required: ['hostname']
          },
          columns: [
            {title: '进程 ID', dataIndex: 'wait_pid'},
            {title: '事务 ID', dataIndex: 'wait_trx_id'},
            {
              title: '当前 SQL', dataIndex: 'waiting_query',width: '20%',
              render: (text) => (<span className="wrap-break">{text}</span>)
            } ,
            {title: '等待开始时间', dataIndex: 'wait_start_time'},
            {title: '等待时长 (s)', dataIndex: 'wait_time'},
            {title: '等待行锁数量', dataIndex: 'waiting_trx_rows_locked'},
            {title: '阻塞进程 ID', dataIndex: 'blocking_pid'},
            {title: '阻塞事务 ID', dataIndex: 'blocking_trx_id'},
            {
              title: '阻塞 SQL', dataIndex: 'blocking_query', width: '20%',
              render: (text) => (<span className="wrap-break">{text}</span>)
            },
            {title: '阻塞开始时间', dataIndex: 'blocking_trx_started'},
            {title: '阻塞事务执行时长', dataIndex: 'blocking_trx_age'},
          ],
          rowKey: 'id',
          // pagination: false,
          scroll: {x: 1480},
        }
      ]
    }

    return (
      <Row>
        <Card { ...sessionLineCard } />
        <Card { ...waitLineCard }>
          <ProcessList dataSources={processList} time={TimeFilter.format(waitTableTime)} onShow={onShow} />
        </Card>
        <ProcessListModal { ...processListModalProps } />
      </Row>
    )
  }
}

Session.propTypes = {
  session: PropTypes.object,
  sessionLineLoading: PropTypes.bool,
  waitLineLoading: PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=> {
  return {
    sessionLineLoading: state.loading.effects['performance/session/getSessionLine'],
    waitLineLoading: state.loading.effects['performance/session/getWaitLine'],
    session: state[model],
    performance: state['performance'],
  }
})(Session)
