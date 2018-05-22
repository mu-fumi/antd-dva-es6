/**
 *
 * @copyright(c) 2017
 * @created by zhangmm
 * @package dbaas-ui
 * @version :  2017-10-30 21:28 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger, constant } from 'utils'
import { DataTable, IconFont } from 'components'
import { Modal, Tooltip, Row, Col, Tag } from 'antd'
import styles from './ipModal.less'

const { HOST_IP } = constant

class IPModal extends React.Component {

  render() {

    const { visible, title, onCancel, onOk, hostIP } = this.props

    const modalOpts = {
      title: title,
      visible:visible,
      onCancel:onCancel,
      onOk:onOk,
    }

    let nodeList = Object.keys(hostIP).map((nodeType)=>{
      if(hostIP[nodeType].filter(v => v === '').length !== hostIP[nodeType].length){
        let list = hostIP[nodeType].filter(v => v !== '').map((v, k) => {
          return (
            <div key={k} className='machine'>
              <Tag>{v}</Tag>
            </div>
          )
        })
        return (
          <Row key={nodeType}>
            <Col span="6">
              <span className="pull-right mgr-10 line-height-28">{HOST_IP[nodeType]}: </span>
            </Col>
            <Col span="18">
              { list }
            </Col>
          </Row>
        )
      }
    })

    return (
      <Modal
        {...modalOpts}
        className={styles['modal-style']}>
        <div className='machine-list tag-list'>
          { nodeList }
        </div>
      </Modal>
    )
  }
}

IPModal.propTypes = {
  visible: PropTypes.bool,
  title: PropTypes.string,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  hostIP: PropTypes.object,
}

export default IPModal
