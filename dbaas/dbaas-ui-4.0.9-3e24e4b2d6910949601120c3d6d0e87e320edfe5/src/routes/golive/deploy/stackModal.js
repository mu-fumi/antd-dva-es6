/**
 * Created by wengyian on 2017/8/18.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, Radio, message, Button, Modal, Steps, Form } from 'antd'
import { DataTable, Layout, Search, Filter, IconFont } from 'components'
import { routerRedux, Link, browserHistory } from 'dva/router'
import { classnames, Cache} from 'utils'
import Json from 'utils/json'
import _ from 'lodash'

const RadioGroup = Radio.Group
const cache = new Cache()

class StackModal extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      visible : props.visible,
      stackList : props.stackList,
      selectedStack : props.selectedStack
    }

    this.handleChange = this.handleChange.bind(this)
    this.onOk = this.onOk.bind(this)
    this.onCancel = this.onCancel.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if(this.state.visible !== nextProps.visible ||
      this.state.selectedStack !== nextProps.selectedStack ||
      !_.isEqual(this.state.stackList, nextProps.stackList)
    ){
      this.setState({
        visible : nextProps.visible,
        stackList : nextProps.stackList,
        selectedStack : nextProps.selectedStack
      })
    }
  }

  handleChange(e){
    let value = e.target.value
    this.setState({
      selectedStack : value
    })
  }

  onCancel(){
    if(this.props.hideStackModal){
      this.props.hideStackModal()
    }
  }

  onOk(){
    if(!this.state.selectedStack){
      message.error('请选择套件！')
      return
    }

    let stackInfo = this.state.stackList.find(item => {
      return this.state.selectedStack === item.id
    })

    cache.put('deploy-stackInfo', Json.dumps(stackInfo))

    if(this.props.hideStackModal){
      this.props.hideStackModal()
      browserHistory.push(`/deploy/create?stackId=${this.state.selectedStack}`)
    }
  }

  render(){
    const content  = (
      <RadioGroup onChange={this.handleChange} value={this.state.selectedStack}>
        {
          this.state.stackList.map(item => {
            return <Radio value={item.id} key={item.id}>{item.name}</Radio>
          })
        }
      </RadioGroup>
    )

    return (
      <Modal
        visible={this.state.visible}
        onCancel={this.onCancel}
        title="选择套件"
        onOk={this.onOk}
      >
        {content}
      </Modal>
    )
  }
}

StackModal.proptypes = {
  visible : PropTypes.bool,
  hideStackModal : PropTypes.func,
  stackList : PropTypes.array,
  selectedStack : PropTypes.oneOfType([PropTypes.string, PropTypes.array])
}

export default StackModal

