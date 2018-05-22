/**
 *
 * @copyright(c) 2017
 * @created by zhangmm
 * @package dbaas-ui
 * @version :  2017-10-30 21:28 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger } from 'utils'
import { DataTable, IconFont } from 'components'
import { Modal, Tooltip, Row, Col, Tag } from 'antd'
import styles from './loginModal.less'

class LoginModal extends React.Component {
  constructor(props){
    super(props)

    this.handleClickNode = this.handleClickNode.bind(this)
  }

  handleClickNode(value){
    if(this.props.changeClickNode){
      this.props.changeClickNode(value)
    }
  }

  render() {

    const { visible, title, onCancel, onOk, nodes, chooseLogin } = this.props

    const modalOpts = {
      title: title,
      visible:visible,
      onCancel:onCancel,
      onOk:onOk,
    }

    let nodeList = Object.keys(nodes).map((nodeType)=>{
      let list = nodes[nodeType].map((v, k) => {
        let className = chooseLogin === v ? 'machine choose' : 'machine'
        return (
          <div key={k} className={className}>
            <Tag onClick={this.handleClickNode.bind(this, v)}>{v}</Tag>
          </div>

        )
      })

      return (
        <Row key={nodeType}>
          <Col span="6">
            <span className="pull-right mgr-10 line-height-28">{nodeType}: </span>
          </Col>
          <Col span="18">
            { list }
          </Col>
        </Row>
      )
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

LoginModal.propTypes = {
  visible: PropTypes.bool,
  title: PropTypes.string,
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  nodes: PropTypes.object,
  chooseLogin: PropTypes.string,
  changeClickNode: PropTypes.func,
}

export default LoginModal
