/**
 * Created by wengyian on 2017/7/7.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, Icon, message, Button, Modal, Steps, Form, Select } from 'antd'
import { DataTable, Layout, Search, Filter, IconFont } from 'components'
import { classnames } from 'utils'
import _ from 'lodash'
import { checkStackUnique } from 'services/stack'

const FormItem = Form.Item
const Option = Select.Option
const { TextArea } = Input

class EditStackInfo extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      stackTags : props.stackTags,
      stackInfo : props.stackInfo,
      stackId : props.stackId,
      type : props.type
    }
    this.next = this.next.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if(!_.isEqual(this.state.stackTags, nextProps.stackTags) ||
      !_.isEqual(this.state.stackInfo, nextProps.stackInfo) ||
      this.state.isStackUnique !== nextProps.isStackUnique ||
      this.state.type !== nextProps.type ||
        this.state.stackId !== nextProps.stackId
    ){
      this.setState({
        stackTags : nextProps.stackTags,
        stackInfo : nextProps.stackInfo,
        type : nextProps.type,
        stackId : nextProps.stackId
      })
    }
  }

  next(){
    const { getFieldsValue, validateFields } = this.props.form

    validateFields((err, values) => {
      if(err) return false
      let data = {...getFieldsValue()}

      if(data.description === undefined){
        data.description = ''
      }

      data.name = data.name.trim()
      if(data.name === ''){
        message.error('请输入套件名称')
        return
      }

      // console.log('data===>', data)

      if(this.state.type === 'edit'){
        data = {...data, stack_id : this.state.stackId,}
        if(this.props.submitStackInfo){
          this.props.submitStackInfo(data)
        }
      }else{
        checkStackUnique({name : data.name, version : data.version})
          .then((res) => {
            if(res.code === 0){
              if(this.props.saveStackInfo){
                this.props.saveStackInfo(data)
              }
              if(this.props.next){
                this.props.next()
              }
            }else{
              message.error(res.msg || res.error)
            }
          })
      }
    })
  }

  render(){

    const { getFieldDecorator } = this.props.form

    const formItemLayout = {
      labelCol : {
        span : 2,
      },
      wrapperCol : {
        span : 12
      }
    }
    // console.log('this.state.stackInfo===>', this.state.stackInfo)

    return (
      <Form
        layout="horizontal"
      >
        <FormItem label="名称" {...formItemLayout}>
          { getFieldDecorator('name', {
            initialValue: this.state.stackInfo ? this.state.stackInfo.name : '',
            rules: [{
              required: true,
              message: '请输入套件名称'
            }]
          })(
            <Input placeholder="请输入套件名称"/>
          ) }
        </FormItem>
        <FormItem label="版本" {...formItemLayout}>
          { getFieldDecorator('version', {
            initialValue: this.state.stackInfo ? this.state.stackInfo.version : '',
            rules: [{
              required: true,
              message: '请输入套件版本'
            }]
          })(
            <Input placeholder="请输入套件版本"/>
          ) }
        </FormItem>
        <FormItem label="类型" {...formItemLayout}>
          {
            getFieldDecorator('tag', {
            initialValue: this.state.stackInfo ? this.state.stackInfo.tag : '',
            rules: [{
              required: true,
              message: '请选择或输入套件类型'
            }]
          })(
            <Select>
              {this.state.stackTags.map((v, k) => {
                return <Option key={k} value={v}>{v}</Option>
              })}
            </Select>
            )
          }
        </FormItem>
        <FormItem label="描述" {...formItemLayout}>
          { getFieldDecorator('description', {
            initialValue: this.state.stackInfo ? this.state.stackInfo.description : '',
            rules: [],
          })(
            <TextArea placeholder="描述"/>
          ) }
        </FormItem>
        <Col offset={2}>
          <Button type="primary" onClick={this.next.bind(this)}>
            {this.state.type === 'edit' ? '保存' : '下一步'}
          </Button>
        </Col>
      </Form>
    )
  }
}

EditStackInfo.propTypes = {
  stackTags : PropTypes.array,
  stackInfo : PropTypes.object,
  next : PropTypes.func,
  stackId : PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  saveStackInfo : PropTypes.func
}

export default Form.create()(EditStackInfo)
