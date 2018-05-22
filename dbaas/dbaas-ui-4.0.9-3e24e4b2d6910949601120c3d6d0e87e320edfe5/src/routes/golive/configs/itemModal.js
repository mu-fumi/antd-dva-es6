/**
 *
 * @copyright(c) 2017
 * @created by lizzy
 * @package dbaas-ui
 * @version :  2017-09-5 21:28 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger } from 'utils'
import { DataTable, IconFont } from 'components'
import { Modal, Tabs } from 'antd'
import styles from './itemModal.less'

class ItemModal extends React.Component {

  render() {

    const { title, visible, type, text, onOk, onCancel } = this.props

    const modalOpts = {
      title,
      visible,
      onOk,
      onCancel,
      wrapClassName: 'vertical-center-modal',
      width: 'auto',
      style: {maxWidth: '40%'},
    }

    return (
      <Modal {...modalOpts} className={styles['modal-style']}>
        <fieldset>
          <legend className="legend">{type}</legend>
          {text}
        </fieldset>
      </Modal>
    )
  }
}

ItemModal.propTypes = {
  title: PropTypes.string,
  type: PropTypes.string,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  text: PropTypes.string,
}

export default ItemModal
