/**
 * Created by wengyian on 2017/12/14.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Select, message, Form, Button, Modal, Checkbox, Input} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames, constant, TimeFilter} from 'utils'
import Json from 'utils/json'
import _ from 'lodash'
import { getService } from 'services/nodes'
import styles from './add.less'

const InputGroup = Input.Group
const Option = Select.Option
const { RELATE_TYPE } = constant

class RelateSelect extends React.Component{
  constructor(props){
    super(props)

    const value = this.props.value || {}

    this.state = {
      type : value.type || RELATE_TYPE.cluster,
      id : value.id,
    }

    this.handleChange = this.handleChange.bind(this)
    this.typeChange = this.typeChange.bind(this)
    this.idChange = this.idChange.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if(!_.isEqual(nextProps.value, this.state.value)){
      this.setState(nextProps.value)
    }
  }

  handleChange(value){
    if(this.props.onChange){
      this.props.onChange(value)
    }
  }

  typeChange(value){
    this.setState({
      type : value
    })

    // this.handleChange(value)

    this.handleChange({
      type : value,
      id : '',
      change : 'type'
    })
  }

  idChange(value){
    this.setState(({
      id : value
    }))

    this.handleChange({
      type : this.state.type,
      id : value,
      change : 'id'
    })
  }


  render(){
    const { relateList = [] } = this.props

    return (
      <InputGroup compact>
        <Select onChange={this.typeChange} value={this.state.type.toString()}>
          <Option value="0">集群</Option>
          {/*******暂时不要实例组了 *************/}
          <Option value="1">实例组</Option>
        </Select>
        <Select onChange={this.idChange} value={this.state.id.toString()}>
          {
            relateList.map(v => {
              return <Option key={v.id} value={v.name + '-_-' + v.id}>
                {v.name}
              </Option>
            })
          }
        </Select>
      </InputGroup>
    )
  }
}

RelateSelect.propTypes = {
  relateList : PropTypes.array,
  value : PropTypes.object,
  onChange : PropTypes.func
}

export default RelateSelect
