/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-15 15:19 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Icon, message, Progress, Card as CardComponent, Table, Modal, Tooltip } from 'antd'

import { DataTable, Layout, Filter, ProgressIcon, Clipboard, Card } from 'components'
import { routerRedux, Link } from 'dva/router'
import { constant, TimeFilter, Gate } from 'utils'
import Panel from './panel'
import ProfilingPanel from './profilingPanel'
import SlowlogModal from './slowlogModal'
import styles from './slowlog.less'

const model = 'performance/slowlog'

class Slowlog extends React.Component {

  componentWillReceiveProps(nextProps) {
    if (this.props.performance.currentNode !== nextProps.performance.currentNode) {
      this.props.dispatch({ type: `${model}/handleTopFilter`, payload: {} })
    }
  }

  render() {
    const {slowlog, dispatch, performance} = this.props
    const {topFilter, explainSQL, profilingSQL, fetchTime, explainReload, profilingReload, slowlogVisible} = slowlog
    const {currentNode, timeRange} = performance

    const filter = {
      top: 10,
      hostname: currentNode,
      time: topFilter['radio'] || TimeFilter.toUnix(topFilter['picker']),
    }

    const topEffect = `${model}/handleTopFilter`
    const onCopy = (e) => {
      Modal.success({
        title: 'SQL已复制',
        content: <div className="wrap-break">{e.text}</div>,
        okText: '好的',
      });
    }
    const onShow = (e) => {
      e.preventDefault()
      dispatch({type: `${model}/showSlowlogModal`})
    }
    const slowlogModalProps = {
      visible: slowlogVisible,
      node: currentNode,
      time: filter.time,
      onOk: () => {
        dispatch({type: `${model}/hideSlowlogModal`})
      },
      onCancel: () => {
        dispatch({type: `${model}/hideSlowlogModal`})
      },
    }

    const showProfilingSQL = Gate.can('performance_profile')
    const handleProfilingParams = (record) => {
      if (showProfilingSQL && record.rows_sent) {
        Modal.confirm({
          title: '提示',
          content: '确定要对此 SQL 进行 profiling 分析吗？',
          okText: '确认',
          cancelText: '取消',
          onOk() {
            dispatch({
              type: `${model}/handleProfiling`,
              payload: {
                profilingSQL: record.sql_text,
                fetchTime: record.fetch_time,
              }
            })
          }
        })
      }
    }

    const fetch = {
      url: '/performance/slowlog',
      data: filter,
      required: ['hostname']
    }

    const topCard = {
      radioProps: [{
        buttons: timeRange,
        props: {
          value: topFilter['radio'],
          onChange: (e) => {
            dispatch({type: topEffect, payload: {time: e.target.value}})
          }
        }
      }],
      pickerProps: [{
        props: {
          // key: +new Date(),
          defaultValue: topFilter['picker'],
          onOk(value) {
            dispatch({
              type: topEffect,
              payload: {time: TimeFilter.toUnix(value)},
            })
          }
        }
      }],
      tableProps: [
        {
          title: () => {
            return (
              <div>
                <h3>慢 SQL 耗时 TOP</h3>
                <Link onClick={onShow.bind(this)} className="pull-right" to="/performance/slowlog/more">查看更多</Link>
              </div>
            )
          },
          pagination: false,
          //size: "small",
          bordered: true,
          fetch: {
            url: '/performance/slowlog',
            data: filter,
            required: ['hostname']
          },
          columns: [
            {
              title: '诊断语句', dataIndex: 'sql_text', width: '30%',
              render: (text) => {
                return <Clipboard data-clipboard-text={text} onSuccess={onCopy}>
                  <Tooltip className="sql-text wrap-break" title="点击即可复制">{text}</Tooltip>
                </Clipboard>
              }
            },
            {title: '用户客户端', dataIndex: 'user_host'},
            {title: '数据库', dataIndex: 'db'},
            {title: '执行时间', dataIndex: 'start_time'},
            {title: '执行时长 (s)', dataIndex: 'query_time'},
            {title: '锁定时长 (s)', dataIndex: 'lock_time'},
            {title: '发送行数', dataIndex: 'rows_sent'},
            {title: '扫描行数', dataIndex: 'rows_examined'},
            {title: '操作',  dataIndex: '', render: (text, record) => {
              const title = !showProfilingSQL ? "没有权限，无法对此 SQL 进行 profiling 分析" : (record.rows_sent ?
                "点击按钮对此 SQL 进行 profiling 分析" : "当前 SQL 发送行数为0，无法进行 profiling 分析")
              const className = "exec-icon " + (showProfilingSQL && record.rows_sent ? '' : 'no-permission')
              return (
              <Tooltip className="sql-text wrap-break" title={title}>
                  <Icon onClick={handleProfilingParams.bind(this, record)} className={className} type="play-circle-o"/>
              </Tooltip>
              )
            }}
          ],
          rowKey: 'id',
          reload: topFilter['reload']
        }
      ]
    }

    const explainProps = {
      title: 'Explain SQL',
      bordered: true,
    }
    const profilingProps = {
      title: 'Profiling SQL',
      bordered: true,
    }

    const columns = [
      {title: 'Key', dataIndex: 'Key', render: (v) => (<span className="explain-title">{v}</span>)},
      {title: 'Value', dataIndex: 'Value',}
    ]

    const explainTableProp = {
      size: "small",
      pagination: false,
      bordered: true,
      columns,
      rowKey: 'Key',
      showHeader: false,
    }
    if (explainSQL.length > 0) {
      explainTableProp['fetch'] = {
        url: '/performance/sql/analysis/explain',
        data: {sql: explainSQL, hostname: currentNode},
        method: 'POST',
        required: ['hostname']
      }
      explainTableProp['reload'] = explainReload
    }
    const profilingTableProp = {
      size: "small",
      pagination: false,
      bordered: true,
      columns: [
        {title: 'Status', dataIndex: 'Status'},
        {title: 'Duration', dataIndex: 'Duration'},
      ],
      rowKey: 'Status',
    }
    if (profilingSQL.length > 0) {
      profilingTableProp['fetch'] = {
        url: '/performance/sql/analysis/profile',
        data: {sql: profilingSQL, fetch_time: fetchTime, hostname: currentNode},
        method: 'POST',
        required: ['hostname']
      }
      profilingTableProp['reload'] = profilingReload
    }

    const explainPanelProps = {
      onClick: (sql) => {
        if (sql.length === 0) {
          message.error('请填写 SQL 语句')
          return false
        }
        dispatch({type: `${model}/handleExplain`, payload: {explainSQL: sql}})
      },
      tableProp: explainTableProp
    }

    const profilingPanelProps = {
      profilingSQL,
      tableProp: profilingTableProp
    }

    return (
      <Row className={styles.slowlog}>
        <Row><Card { ...topCard } /></Row>
        <Row gutter={16} type="flex" justify="space-between" className="panel">
          <Col span="12">
            <CardComponent {...explainProps}>
              <Panel {...explainPanelProps } />
            </CardComponent>
          </Col>
          <Col span="12">
            <CardComponent {...profilingProps} >
              <ProfilingPanel {...profilingPanelProps } />
            </CardComponent>
          </Col>
        </Row>
        <SlowlogModal {...slowlogModalProps} />
      </Row>
    )
  }
}

Slowlog.propTypes = {
  slowlog: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=> {
  return {
    slowlog: state[model],
    performance: state['performance'],
  }
})(Slowlog)
