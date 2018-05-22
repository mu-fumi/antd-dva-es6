/**
 * Created by wengyian on 2017/10/31.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, constant } from 'utils'
import { Slider, InputNumber, Row, Col } from 'antd'

export default class SliderInput extends React.Component{

  state =  {
    inputValue: this.props.value || this.props.min
  }

  handleChange = (value) => {
    this.setState({
      inputValue : value
    },)
    this.onChange(value)
  }


  onChange = (value) => {
    if(this.props.onChange){
      this.props.onChange(value || this.state.inputValue)
    }
  }

  render(){

    const min = this.props.min
    const max = this.props.max
    const marks = {
      [min] : min,
      [max] : max
    }

    return (
      <Row>
        <Col span={12}>
          <Slider marks={marks} min={min} max={max || 10240} onChange={this.handleChange} value={this.state.inputValue}/>
        </Col>
        <Col span={4}>
          <InputNumber
            min={min}
            max={max}
            style={{ marginLeft: 16 }}
            value={this.state.inputValue}
            onChange={this.handleChange}
          />
        </Col>
        <Col style={{marginLeft : '8px'}} span={1}>{this.props.unit}</Col>
      </Row>
    )
  }
}

SliderInput.propTypes = {
  min : PropTypes.number,
  max : PropTypes.number,
  unit : PropTypes.string,
}
