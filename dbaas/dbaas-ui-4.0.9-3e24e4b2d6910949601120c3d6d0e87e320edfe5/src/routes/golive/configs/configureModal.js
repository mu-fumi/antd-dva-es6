/**
 *
 * @copyright(c) 2017
 * @created by zhangmm
 * @package dbaas-ui
 * @version :  2017-10-19 21:28 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger } from 'utils'
import { DataTable, IconFont } from 'components'
import { Modal, Tooltip } from 'antd'
import styles from './configureModal.less'

class ConfigureModal extends React.Component {

  render() {

    const { visible, title, onCancel, onOk, dataSource } = this.props

    const modalOpts = {
      title: title,
      visible,
      onCancel:onCancel,
      onOk:onOk,
      wrapClassName: 'vertical-center-modal',
      width: 'auto',
      style: {maxWidth: '60%'},
    }

    const tableProps = {
      rowKey: 'key',
      columns:[{
        title: '配置项',
        dataIndex: 'key',
        key: 'key',
        width:'400px'
      },
      {
        title: '变更前',
        dataIndex: 'before',
        key: 'before',
        width:'400px',
        render: (text) =>{
          return (
            <Tooltip title={text} placement="left" overlayClassName="tooltip-style">
              <span className="text-ellipsis-1">{text}</span>
            </Tooltip>
          )
        }
      },
      {
        title: '变更后',
        dataIndex: 'after',
        key: 'after',
        width:'400px',
        render: (text) =>{
          return (
            <Tooltip title={text} placement="left" overlayClassName="tooltip-style">
              <span className="text-ellipsis-1">{text}</span>
            </Tooltip>
          )
        }
      }],
      //reload:reload,
      pagination:false,
      size:'small',
      bordered:true,
      dataSource:dataSource
    }

    return (
      <Modal {...modalOpts} className={styles['modal-style']}>
        <DataTable {...tableProps} />
      </Modal>
    )
  }
}

ConfigureModal.propTypes = {
  visible: PropTypes.bool,
  title: PropTypes.string,
  dataSource: PropTypes.array,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
}

export default ConfigureModal
