/**
 * Created by zhangmm on 2017/9/1.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './editVersion.less'
import { DataTable, Filter, IconFont } from 'components'
import { Link } from 'dva/router'
import { Col, Row , Form, Input, Button, Select,Modal } from 'antd'
const { TextArea } = Input
const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm
import { constant } from 'utils'
const {NAME_COMPLEXITY, VERSION_COMPLEXITY} = constant

class EditVersion extends Base{
  constructor(props){
    super(props)
    //设置返回按钮
    this.setGobackBtn()
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: "版本编辑", selectedKey: '程序包管理packages'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    //返回时清空输入域里的值
    this.push({
      type:"editVersion/handleReset"
    })
    this.checkName = this.checkName.bind(this)
    this.checkVersion = this.checkVersion.bind(this)
  }

  handleSubmit = (e) =>{
    e.preventDefault()
    //获取路由的id
    const id = this.props.match.params.id
    const pkgid = this.props.match.params.pkgid
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      this.props.dispatch({type:'editVersion/handleRecommit',payload:{recommit:true}})
      this.props.dispatch({
        type:"editVersion/editVersion",
        payload:{
          values:values,
          id: id,
          pkgid:pkgid
        }
      })
    })
  }

  checkName (rule, value, callback) {
    if (!value) {
      callback()
    }
    else {
      NAME_COMPLEXITY.forEach((d)=>{
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

  checkVersion (rule, value, callback) {
    if (!value) {
      callback()
    }
    else {
      VERSION_COMPLEXITY.forEach((d)=>{
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
    const { location, dispatch, editVersion, form } = this.props
    const { getFieldDecorator } = form
    const { version_name, package_name, demo, recommit } = editVersion

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
      <Row className={styles.editVersion}>
        <Row className="inner-cont">
          <Form onSubmit={this.handleSubmit}>
            <FormItem label="版本名称:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('version_name', {
                initialValue : version_name,
                rules: [{
                  required: true,
                  message: '请输入版本名称',
                },{
                  validator: this.checkVersion
                }],
              })(
                <Input placeholder="版本名称"/>
              )}
            </FormItem>
            <FormItem label="包文件名:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('package_name', {
                initialValue : package_name,
                rules: [{
                  required: false,
                  message: '请输入包文件名',
                },{
                  pattern:/^[^\s]+$/,
                  message:'包文件名不能包含空格'
                },{
                  pattern:/^[^\/\\]+$/,
                  message:'包文件名不能包含/或者\\字符'
                },{
                  max:50,
                  message: '包文件名的最大长度为50',
                }],
              })(
                <Input placeholder="包文件名"/>
              )}
            </FormItem>
            <FormItem label="备注:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('demo',{
                initialValue : demo,
                rules: [{
                  required: false,
                  message: '请输入备注',
                },{
                  max:100,
                  message: '备注的最大长度为100',
                }],
              })(
                <TextArea placeholder="备注" autosize={{ minRows: 2, maxRows: 6 }} />
              )}
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit" className="margin-but" loading={recommit}>确定</Button>
            </FormItem>
          </Form>
        </Row>
      </Row>
    )
  }
}

EditVersion.propTypes = {
  editVersion: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    editVersion: state['editVersion'],
    loading: state.loading.effects,
  }
})(Form.create()(EditVersion))
