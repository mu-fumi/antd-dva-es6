/**
 *
 * @copyright(c) 2017
 * @created by zhangmm
 * @package dbaas-ui
 * @version :  2017-09-5 21:28 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger } from 'utils'
import { DataTable, IconFont } from 'components'
import { Modal, Tabs } from 'antd'
import styles from './configModal.less'

class ConfigModal extends React.Component {

  render() {

    const { title, visible, text, type, onOk, onCancel } = this.props

    const modalOpts = {
      title,
      visible,
      onOk,
      onCancel,
      wrapClassName: 'vertical-center-modal',
      width: 'auto',
      style: {maxWidth: '60%'},
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

ConfigModal.propTypes = {
  title: PropTypes.string,
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  text: PropTypes.string,
  type: PropTypes.string,
}

export default ConfigModal
