/**
 * Created by wengyian on 2017/9/15.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Input, message, Form, Button, Modal, Card, Tag} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames} from 'utils'
import _ from 'lodash'
import {constant, TimeFilter} from 'utils'
import style from './summary.less'

const CheckableTag = Tag.CheckableTag;

class SwitchMasterModal extends React.Component{
  constructor(props){
    super(props)

    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)

    this.state = {
      selectedSlave : {}
    }
  }

  componentWillReceiveProps(nextProps){

  }

  handleOk(){
    if(!this.state.selectedSlave.id){
      message.error('请选择要切换的备机')
      return
    }
    const master = [{id : 1, node_addr : 'HCF1.0'}]

    const masterName = master[0] && master[0].node_addr
    const slaveName = this.state.selectedSlave.node_addr
    const data = {
      cur_id : master[0] && master[0].id,
      next_id : this.state.selectedSlave.id,
      id : this.props.clusterId
    }
    const content = `主机将从 ${masterName} 切换到 ${slaveName}`
    Modal.confirm({
      title : '是否确定要进行主从切换？',
      content : content,
      onOk : () => {
        if(this.props.onOk){
          this.props.onOk(data)
        }
        this.setState({
          selectedSlave : ''
        })
      }
    })
  }

  handleCancel(){
    if(this.props.onCancel){
      this.props.onCancel()
    }
    this.setState({
      selectedSlave  : ''
    })
  }

  handleClick(item, checked){
    // console.log('item===>', item)
    // console.log('checked===>', checked)
    const newSelected = checked ? item : ''
    this.setState({
      selectedSlave : newSelected
    })
  }

  render(){
    const footer = <Row className="text-right">
      <Button onClick ={this.handleCancel}>返回</Button>
      <Button type="primary" onClick={this.handleOk}>切换</Button>
    </Row>

    // console.log('this.props.switchMasterModalVisible===>', this.props.switchMasterModalVisible)

    const master = [{id : 1, node_addr : 'HCF1.0'}]
    const slave = [{
      id : 2,
      node_addr : 'HCF2.0'
    },{
      id : 3,
      node_addr : 'HCF3.0'
    },{
      id : 4,
      node_addr : 'HCF4.0'
    }]

    const masterContent = master.map( v => {
      return <span key={v.id}>{v.node_addr}</span>
    })

    const slaveContent = slave.map( v => {
      return <CheckableTag
        key={v.id}
        checked={v.id === this.state.selectedSlave.id}
        onChange={(checked) => this.handleClick(v, checked)}
      >
        {v.node_addr}
      </CheckableTag>
    })


    return (
      <Modal
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        title="选择新的主机"
        footer={footer}
      >
        <Row>
          <span>当前主机：</span>
          <span>{masterContent}</span>
        </Row>
        <Row className={style["mgt-8"]}>
          <span>当前备机：</span>
          <span>{slaveContent}</span>
        </Row>
      </Modal>
    )
  }
}

SwitchMasterModal.propTypes = {
  onOk : PropTypes.func,
  onCancel : PropTypes.func,
  visible : PropTypes.bool,
  clusterId : PropTypes.number,
}

export default SwitchMasterModal
