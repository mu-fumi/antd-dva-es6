/**
 * Created by zhangmm on 2017/9/6.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './setting.less'
import { DataTable, Filter, IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Form, Input, Button, Select } from 'antd'
import { PASSWORD_COMPLEXITY } from '../../utils/constant'

const FormItem = Form.Item
const Option = Select.Option

class Setting extends Base{
  constructor(props){
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.checkPass = this.checkPass.bind(this)
    this.checkPass2 = this.checkPass2.bind(this)
    //设置返回按钮
    this.setGobackBtn()
    //返回时清空输入域里的值
    this.push({
      type:"setting/handleReset"
    })
  }

  handleSubmit = (e) =>{
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      this.props.dispatch({
        type:"setting/editSetting",
        payload:values
      })
    })
  }

  checkPass (rule, value, callback) {
    if (!value) {
      callback()
    }
    else {
      PASSWORD_COMPLEXITY.forEach((d)=>{
        if(!isNaN(d.exp) ){
          if(value.length<d.exp){
            callback ([new Error(d.msg)])
          }
        }else if( Array.isArray(d.exp)  ){
          let state =0
          d.exp.forEach((v)=>{
            if( !value.match(v)){
              state ++
            }
          })
          if(state>0 ){
            callback ([new Error(d.msg)])
          }
        }else {
          if( !value.match(d.exp)){
            callback ([new Error(d.msg)])
          }
        }
      })
      callback()
    }
  }

  checkPass2 (rule, value, callback) {
    if (!value) {
      callback()
    }
    if(value != this.props.form.getFieldValue('password')){
      callback ([new Error('两次密码不一致')])
    }
    callback()
  }


  render(){
    const { location, dispatch, setting, form } = this.props
    const { getFieldDecorator } = form
    const { old_password, password, password_confirmation } = setting

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
      <Row className={styles.setting}>
        <Row className="inner-cont">
          <Form onSubmit={this.handleSubmit}>
            <FormItem label="原密码:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('old_password', {
                initialValue:old_password,
                rules: [{
                  required: true,
                  message: '请输入原密码',
                }],
              })(
                <Input placeholder="原密码" type='password'/>
              )}
            </FormItem>
            <FormItem label="新密码:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('password', {
                initialValue:password,
                rules: [{
                  required: true,
                  message: '请输入新密码',
                },
                {
                  validator: this.checkPass
                }],
              })(
                <Input placeholder="新密码" type='password'/>
              )}
            </FormItem>
            <FormItem label="确认密码:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('password_confirmation', {
                initialValue:password_confirmation,
                rules: [{
                  required: true,
                  message: '请输入确认密码',
                },
                {
                  validator: this.checkPass2
                }],
              })(
                <Input placeholder="确认密码" type='password'/>
              )}
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit" className="margin-but">修改</Button>
            </FormItem>
          </Form>
        </Row>
      </Row>
    )
  }
}

Setting.propTypes = {
  setting: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    setting: state['setting'],
    loading: state.loading.effects,
  }
})(Form.create()(Setting))
