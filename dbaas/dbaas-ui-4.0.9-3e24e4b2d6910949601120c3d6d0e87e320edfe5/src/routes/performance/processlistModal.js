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
import styles from './processlistModal.less'

const ProcessListModal = ({ visible, node, time, onOk, onCancel }) =>{

  const modalProps = {
    title: <div className={styles["card-title"]}><h3>PROCESSLIST<span>时间点: {TimeFilter.format(time)}</span></h3></div>,
    visible,
    onOk,
    onCancel,
    width: '70%',
  }
  const tableProps = {
    fetch: {
      url: `/performance/processlist`,
      data: {
        hostname: node,
        time: time,
      },
      required: ['hostname']
    },
    columns: [
      { title: 'ID', dataIndex: 'ID' },
      { title: 'USER', dataIndex: 'USER' },
      { title: 'HOST', dataIndex: 'HOST' },
      { title: 'DB', dataIndex: 'DB' },
      { title: 'COMMAND', dataIndex: 'COMMAND'},
      { title: 'TIME', dataIndex: 'TIME' },
      { title: 'STATE', dataIndex: 'STATE' },
      { title: 'INFO', dataIndex: 'INFO', width: '30%', className: 'wrap-break' },
    ],
    rowKey: 'ID',
    bordered: true,
  }

  return (
    <Modal {...modalProps}>
      <DataTable { ...tableProps } />
    </Modal>
  )
}

ProcessListModal.propTypes = {
  visible: PropTypes.bool,
  node: PropTypes.string,
  time: PropTypes.number,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
}

export default ProcessListModal
