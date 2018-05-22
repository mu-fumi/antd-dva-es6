/**
 * Created by wengyian on 2018/3/27.
 */


import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Input, message, Form, Checkbox, Modal, Select, Tag} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames, constant, Logger} from 'utils'
import _ from 'lodash'
import styles from './modal.less'

const Option = Select.Option

class ReportModal extends React.Component{
  constructor(props) {
    super(props)

    this.makeSure = this.makeSure.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.handleCheckChange = this.handleCheckChange.bind(this)

    this.state = {
      selectedNodes: {},
      total_report: false,
    }
  }

  handleOk() {
    const { selectedNodes, total_report } = this.state
    let nodes = {}
    for(let key in selectedNodes) {
      if(selectedNodes[key].length) {
        nodes[key] = selectedNodes[key]
      }
    }
    const data = {
      nodes,
      total_report,
      report_type: 'quick'
    }
    // Logger.info('data===>', data)
    if(this.props.onOk) {
      this.props.onOk(data)
    }
  }

  makeSure() {
    let nodes = []
    const { selectedNodes } = this.state
    for (let key in selectedNodes) {
      if (selectedNodes[key].length){
        nodes = [...nodes, ...selectedNodes[key]]
      }
    }
    let stringNodes = nodes.join('，')
    const content = `确定要对当前时间的节点 ${stringNodes}, 进行一键检查吗?`
    Modal.confirm({
      title: '提示',
      content,
      onOk: this.handleOk
    })
  }

  handleChange(key, val){
    this.setState({
      selectedNodes: {
        ...this.state.selectedNodes,
        [key]: val
      }
    })
  }

  handleCheckChange(e) {
    const isCheck = e.target.checked
    this.setState({
      total_report: isCheck
    })
  }

  render() {
    const { visible, onCancel, title, nodes = {} } = this.props

    return (
      <Modal
        visible={visible}
        onCancel={onCancel}
        title={title}
        onOk={this.makeSure}
        className={styles['modal']}
      >
        {
          Object.keys(nodes).map((key, index) => {
            let children = []
            const nodeKey = Object.keys(nodes[key] || {})
            for (let i = 0; i < nodeKey.length; i++) {
              const itemKey = nodeKey[i]
              children.push(<Option key={i} value={itemKey}>{nodes[key][itemKey]}</Option>)
            }
            return <Row key={index} className={styles['item']}>
              <Col span="8" className={styles['name-item']}>{key}</Col>
              <Col span="16" className={styles['content-item']}>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="节点，可输入关键字搜索"
                  onChange={this.handleChange.bind(this, key)}
                >
                  {children}
                </Select>
              </Col>
            </Row>
          })
        }
        <Row>
          <Checkbox onChange={this.handleCheckChange}>汇总报告</Checkbox>
        </Row>
      </Modal>
    )
  }
}

ReportModal.propTypes = {
  visible: PropTypes.bool,
  onCancel : PropTypes.func,
  onOk : PropTypes.func,
  title: PropTypes.string,
  nodes: PropTypes.object
}

export default ReportModal
