/**
 * Created by wengyian on 2017/8/30.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {Row, Col, Input, Tabs, message, Button, Tag, Modal} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ConfigInput} from 'components'
import {routerRedux, Link, browserHistory} from 'dva/router'
import {classnames} from 'utils'
import _ from 'lodash'
import {constant, TimeFilter, Cache} from 'utils'
import Json from 'utils/json'

const { CheckableTag } = Tag

const formItemLayout = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 12
  }
}

class HostModal extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      selectedHost : props.selectedHost || []
    }

    this.handleOk = this.handleOk.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if(!_.isEqual(this.state.selectedHost, nextProps.selectedHost)){
      this.setState({
        selectedHost : nextProps.selectedHost || []
      })
    }
  }

  handleOk(){
    // 传参出去
    let data = [...this.state.selectedHost]
    data = data.filter(v => v !== '')
    this.props.onOk && this.props.onOk(data)
  }

  handleCancel(){
    this.props.onCancel && this.props.onCancel()
  }

  handleChange(type,isRadio, checked){
    const { selectedHost } = this.state
    // console.log('selectedHost===>', selectedHost)
    let newSelectedHost = []
    if(isRadio){
      newSelectedHost = checked ? [type] : []
    }else{
      newSelectedHost = checked ? [...selectedHost, type]
        : selectedHost.filter(v => v != type)
    }

    // console.log('newSelectedHost===>', newSelectedHost)
    this.setState({
      selectedHost : newSelectedHost
    })
  }

  render(){
    let type = this.props.hostKey && this.props.hostKey.split('-_-')[this.props.hostKey.split('-_-').length -1]
    let titleName = type === 'master' ? '主机' : ( type === 'slave'? '备机' : '')
    let isRadio = (type === 'master')
    let selectedHost = this.state.selectedHost || []

    return (
      <Modal
        title={`请选择${titleName}`}
        visible={this.props.visible}
        key={this.props.hostKey}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        {
         this.props.host && this.props.host.map(val => {
           return( <CheckableTag
            key={val}
            checked={selectedHost.indexOf(val) > -1}
            onChange={(checked) => this.handleChange(val, isRadio, checked)}
           >
             {val}
           </CheckableTag> )
         })
        }
      </Modal>
    )
  }
}

HostModal.propTypes = {
  selectedHost : PropTypes.array,
  visible : PropTypes.bool,
  hostKey : PropTypes.string,
  onOk : PropTypes.func,
  onCancel : PropTypes.func,
}

export default HostModal
