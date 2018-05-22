/**
 * Created by wengyian on 2017/8/19.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, Radio, message, Button, Modal, Steps, Form } from 'antd'
import { DataTable, Layout, Search, Filter, IconFont } from 'components'
import { routerRedux, Link } from 'dva/router'
import { classnames, Cache} from 'utils'
import Json from 'utils/json'
import _ from 'lodash'

const RadioGroup = Radio.Group

class InstanceModal extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      visible : props.visible,
      instanceList : props.instanceList
    }

    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if(!_.isEqual(nextProps.instanceList, this.state.instanceList) ||
      nextProps.visible !== this.state.visible
    ){
      this.setState({
        visible : nextProps.visible,
        instanceList : nextProps.instanceList
      })
    }
  }

  handleOk(){
    if(!this.state.selected){
      message.error('请选择一个实例')
      return
    }

    this.props.setSelectedStack && this.props.setSelectedStack(this.state.selected)
    this.props.hideInstanceModal && this.props.hideInstanceModal()
    this.props.showStackModal && this.props.showStackModal()
  }

  handleCancel(){
    if(this.props.hideInstanceModal){
      this.props.hideInstanceModal()
    }
  }

  handleChange(e){
    const value = e.target.value
    this.setState({
      selected : value
    })
  }

  render(){
    const content = <RadioGroup onChange={this.handleChange}>
      {
        this.state.instanceList.map(item => {
          return <Radio key={item.id} value={item.id}>{item.name}</Radio>
        })
      }
    </RadioGroup>

    return (
      <Modal
        title="选择实例"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        visible={this.state.visible}
      >
        {content}
      </Modal>
    )
  }
}

InstanceModal.proptypes = {
  instanceList : PropTypes.array,
  hideInstanceModal : PropTypes.func,
  setSelectedStack : PropTypes.func,
  showStackModal : PropTypes.func,
}

export default InstanceModal
