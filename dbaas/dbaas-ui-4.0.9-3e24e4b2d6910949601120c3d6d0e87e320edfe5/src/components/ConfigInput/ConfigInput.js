/**
 * Created by wengyian on 2017/8/24.
 */

import React, {Component} from 'react';
import { Row, Col, Spin, message, Input } from 'antd'
import { request, Logger } from 'utils'
import { CONFIG_INPUT } from 'utils/constant'
import _ from 'lodash'
import PropTypes from 'prop-types'

class ConfigInput extends React.Component{
  constructor(props){
    super(props)
    // console.log('props===>', props)
    // 此处的 state 需要把可能用到的值都弄上 别的有需要的时候再加
    // 此处的 value 给 '' 因为 InputNumber 会导致 value 为 undefined antd 的验证失效
    this.state = {
      type : props.type || 'input',
      disabled : props.disabled || false,
      value : props.value || '',
      checked : props.checked,
    }

    this.tagChange = this.tagChange.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if(this.state.type !== nextProps.type ||
      this.state.disabled !== nextProps.disabled ||
      !_.isEqual(this.state.value, nextProps.value) ||
        this.state.checked !== nextProps.checked
    ){
      this.setState({
        type : nextProps.type || 'input',
        disabled : nextProps.disabled || false,
        value : nextProps.value || '',
        checked : nextProps.checked
      })
    }
  }

  // 组件对外的 onChange
  onChange(value){
    if(this.props.onChange){
      this.props.onChange(value)
    }
  }

  // 每个组件的 onchange
  tagChange(type, e){
    // console.log('type===>', type)
    // console.log('e===>', e)

    // 当 type 为 input 的时候 e 是 event type 为 inputNumber, switch 时为具体的值
    let value = ( type === 'input' ? e.target.value : e)
    this.onChange(value)
  }

  render(){
    const element = CONFIG_INPUT[this.state.type] || <Input />
    let props = {...this.props};
    delete props.type
    return React.cloneElement(
      element,
      {
        disabled : this.state.disabled,
        value : this.state.value,
        onChange : (e) => this.tagChange(this.state.type, e),
        checked : this.state.checked,
        ...props
      }
    )
  }
}

ConfigInput.propTypes = {
  type : PropTypes.string,
  disabled : PropTypes.bool,
  checked : PropTypes.bool,
  onChange : PropTypes.func,
}

export default ConfigInput
