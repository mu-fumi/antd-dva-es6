/**
 * Created by Lizzy on 2018/3/9.
 */


import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger } from 'utils'
import { DataTable, IconFont } from 'components'
import { Modal, Tabs, Table } from 'antd'
import styles from './sqlModal.less'


class ShowMoreModal extends React.Component {

  render() {

    const { visible, text, modalType, onOk, onCancel } = this.props

    const modalOpts = {
      title: modalType,
      visible,
      onOk,
      onCancel,
      wrapClassName: 'vertical-center-modal',
      width: 'auto',
      style: {maxWidth: '60%'},
    }

    // if(modalType === 'SQL 语句'){  //  sql语句modal框内容比较多
    //   modalOpts.width = 'auto' //  加上这个maxWidth才生效
    //   modalOpts.style= {maxWidth: '60%'}
    // }

    return (
      <Modal {...modalOpts} className={styles['sql-modal']}>
        <pre>{text}</pre>
      </Modal>
    )
  }
}

ShowMoreModal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  modalType: PropTypes.string,
  onOk: PropTypes.func,
  text: PropTypes.string
}

export default ShowMoreModal
