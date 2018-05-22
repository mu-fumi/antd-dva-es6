/**
 *
 * @copyright(c) 2017
 * @created by zhangmm
 * @package dbaas-ui
 * @version :  2017-10-19 21:28 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger, constant } from 'utils'
import { DataTable, IconFont } from 'components'
import { Modal, Tooltip, Badge, Table } from 'antd'


class PrivilegeModal extends React.Component {

  render() {
    const { title, visible, onOk, onCancel, dataSource, pvlgSelection } = this.props

    const modalProps = {
      title: title,
      visible:visible,
      onOk:onOk,
      onCancel:onCancel
    }

    const pvlgCols = [{
      title: '所有',
      dataIndex: 'privilege',
    }]

    const tableProps = {
      pagination:false,
      columns:pvlgCols,
      dataSource:dataSource,
      rowSelection:pvlgSelection
    }

    return (
      <Modal {...modalProps}>
        <Table {...tableProps}/>
      </Modal>
    )
  }
}

PrivilegeModal.propTypes = {
  title:PropTypes.string,
  visible:PropTypes.bool,
  onOk:PropTypes.func,
  onCancel:PropTypes.func,
  dataSource:PropTypes.array,
  pvlgSelection:PropTypes.object,
}

export default PrivilegeModal
