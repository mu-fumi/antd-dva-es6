/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-23 20:04 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { DataTable } from 'components'
import { TimeFilter } from 'utils'
import { Modal } from 'antd'


const SlowlogModal = ({ visible, node, time, onOk, onCancel }) =>{

  const modalProps = {
    title: <div className="card-title"><h3>慢 SQL 列表</h3></div>,
    visible,
    onOk,
    onCancel,
    width: '70%',
  }
  const tableProps = {
    fetch: {
      url: `/performance/slowlog`,
      data: {
        hostname: node,
        time: time,
      },
      required: ['hostname']
    },
    columns: [
      {title: '诊断语句', dataIndex: 'sql_text', width: '30%',
        render: (text) =>  <div className="sql-text wrap-break" title="点击即可复制">{text}</div>
      },
      {title: '用户客户端', dataIndex: 'user_host'},
      {title: '数据库', dataIndex: 'db'},
      {title: '执行时间', dataIndex: 'start_time', sorter: true, },
      {title: '执行时长 (s)', dataIndex: 'query_time', sorter: true },
      {title: '锁定时长 (s)', dataIndex: 'lock_time',sorter: true },
      {title: '发送行数', dataIndex: 'rows_sent', sorter: true},
      {title: '扫描行数', dataIndex: 'rows_examined', sorter: true},
    ],
    rowKey: 'id',
    bordered: true,
    scroll: {x:1500}
  }

  return (
    <Modal {...modalProps}>
      <DataTable { ...tableProps } />
    </Modal>
  )
}

SlowlogModal.propTypes = {
  visible: PropTypes.bool,
  node: PropTypes.string,
  time: PropTypes.string,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
}

export default SlowlogModal
