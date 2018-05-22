/**
 * Created by wengyian on 2017/7/31.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, Icon, message, Button, Modal, Form, Select } from 'antd'
import { DataTable, Layout, Search, Filter, IconFont } from 'components'
import { classnames } from 'utils'
import { Link } from 'dva/router'
import _ from 'lodash'
import { SERVICE_TYPE } from 'utils/constant'
import { checkServiceUnique } from 'services/stack'

const FormItem = Form.Item
const Option = Select.Option
const { TextArea } = Input

class EditServiceInfo extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      serviceInfo : props.serviceInfo,
    }
  }

  componentWillReceiveProps(nextProps){
    if( !_.isEqual(nextProps.serviceInfo, this.state.serviceInfo)){
      this.setState({
        serviceInfo : nextProps.serviceInfo,
      })
    }
  }

  next(){
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      values.description === undefined && (values.description = '')

      let params = { name : values.name, version : values.version}

      checkServiceUnique(params)
        .then((res) => {
          if(res.code === 0){
            if(this.props.saveServiceInfo){
              this.props.saveServiceInfo(values)
            }
            if(this.props.next){
              this.props.next()
            }
          }else{
            message.error(res.msg)
          }
        })
    })
  }

  render(){

    const { getFieldDecorator } = this.props.form

    const formItemLayout = {
      labelCol : {
        span : 2
      },
      wrapperCol : {
        span : 12
      }
    }

    return(
      <Form
        layout="horizontal"
      >
        <FormItem label="名称" {...formItemLayout}>
          { getFieldDecorator('name', {
            initialValue: this.state.serviceInfo.name ? this.state.serviceInfo.name : '',
            rules: [{
              required: true,
              message: '请输入服务名称'
            }]
          })(
            <Input placeholder="请输入服务名称"/>
          ) }
        </FormItem>
        <FormItem label="版本" {...formItemLayout}>
          { getFieldDecorator('version', {
            initialValue: this.state.serviceInfo.version ? this.state.serviceInfo.version : '',
            rules: [{
              required: true,
              message: '请输入服务版本'
            }]
          })(
            <Input placeholder="请输入服务版本"/>
          ) }
        </FormItem>
        <FormItem label="类型" {...formItemLayout}>
          {
            getFieldDecorator('type', {
              initialValue: this.state.serviceInfo.type !== undefined ? String(this.state.serviceInfo.type) : '',
              rules: [{
                required: true,
                message: '请选择或输入服务类型'
              }]
            })(
              <Select>
                { Object.keys(SERVICE_TYPE).map( (v, k) => {
                  return <Option key={k} value={SERVICE_TYPE[v]}>{v}</Option>
                })}
              </Select>
            )
          }
        </FormItem>
        <FormItem label="描述" {...formItemLayout}>
          { getFieldDecorator('description', {
            initialValue: this.state.serviceInfo.description ? this.state.serviceInfo.description : '',
            rules: [],
          })(
            <TextArea placeholder="描述"/>
          ) }
        </FormItem>
        <Col offset={2}>
          <Button type="primary" onClick={this.next.bind(this)}>
            下一步
          </Button>
        </Col>
      </Form>
    )
  }
}

EditServiceInfo.propTypes = {
  serviceInfo : PropTypes.object,
  next : PropTypes.func,
  form : PropTypes.object,
}

export default Form.create()(EditServiceInfo)
