/**
 * Created by zhangmm on 2017/7/4.
 */
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './create.less'
import { DataTable, Filter } from 'components'
import { Row , Button , Form , Input , Radio, Select} from 'antd'
const { TextArea } = Input
import { constant } from 'utils'
const {PACKAGE_COMPLEXITY, PATH_COMPLEXITY} = constant

const FormItem = Form.Item

class CreatePackage extends React.Component{

  constructor(props){
    super(props)

    this.handleSubmit = this.handleSubmit.bind(this)
    this.checkPackage = this.checkPackage.bind(this)
    this.checkPath = this.checkPath.bind(this)
  }

  handleSubmit = (e) =>{
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      const data = {
        ...this.props.form.getFieldsValue()
      }
/*      const tempLocation = data['location'] ? data['location'] : ''
      if(data['location']){
        delete data['location']
      }
      const tempData = {
        ...data,
        location:("/data/dbaas/packages/" + tempLocation).replace(/\s+/g, "")
      }*/
      if(this.props.onSubmit){
        this.props.onSubmit(data)
      }
    })
  }

  checkPackage (rule, value, callback) {
    if (!value) {
      callback()
    }
    else {
      PACKAGE_COMPLEXITY.forEach((d)=>{
        if(Array.prototype.isPrototypeOf(d.exp)){
          if(value.length>d.exp[1] || value.length<d.exp[0]){
            callback ([new Error(d.msg)])
          }
        }else {
          if( !value.match(d.exp)){
            callback ([new Error(d.msg)])
          }
        }
      })
    }
    callback()
  }

  checkPath (rule, value, callback) {
    if (!value) {
      callback()
    }
    else {
      PATH_COMPLEXITY.forEach((d)=>{
        if(Array.prototype.isPrototypeOf(d.exp)){
          if(value.length>d.exp[1] || value.length<d.exp[0]){
            callback ([new Error(d.msg)])
          }
        }else {
          if( !value.match(d.exp)){
            callback ([new Error(d.msg)])
          }
        }
      })
    }
    callback()
  }

  render(){
    const { package_name , location ,memo, recommit} = this.props
    const { getFieldDecorator } = this.props.form

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
      },
    }


    return(
      <Form onSubmit={this.handleSubmit}>
        <FormItem label="程序包名称:"  {...formItemLayout} hasFeedback>
          {getFieldDecorator('package_name', {
            initialValue : package_name,
            rules: [{
              required: true,
              message: '请输入程序包名称',
            },{
              validator: this.checkPackage
            }],
          })(
            <Input placeholder="程序包名称"  id="package_name " name="package_name "/>
          )}
        </FormItem>
{/*        <FormItem label="默认部署路径:"  {...formItemLayout} hasFeedback>
          {getFieldDecorator('location', {
            initialValue : location,
            rules: [{
              required: true,
              message: '请输入部署路径',
           },
          {
            validator: this.checkPath
          }],
          })(
            <Input addonBefore="/data/dbaas/packages/" placeholder="默认部署路径"  id="location" name="location" style={{width:"100%"}}/>
          )}
        </FormItem>*/}
        <FormItem label="备注:"  {...formItemLayout} hasFeedback>
          {getFieldDecorator('memo',{
            initialValue : memo,
            rules: [{
              required: false,
              message: '请输入备注',
            },{
              max:100,
              message: '备注的最大长度为100',
            }],
          })(
            <TextArea placeholder="备注" id="memo" name="memo" autosize={{ minRows: 2, maxRows: 6 }} />
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" style={{marginLeft:"16.666%"}} loading={recommit}>确定</Button>
        </FormItem>
      </Form>
    )
  }
}
export default Form.create({})(CreatePackage)
