/**
 * Created by lizzy on 2018/4/20.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './index.less'
import { DataTable, Filter , IconFont, ProgressIcon, StateIcon } from 'components'
import { Link } from 'dva/router'
import { Row , Col , Modal, Icon, Tooltip, Table, Badge, Select, Form, Input, Button } from 'antd'
import { classnames, TimeFilter, constant, Cache } from 'utils'
import DynamicFieldSet from './DynamicFieldSet'

const cache = new Cache()
const {NAME_COMPLEXITY, PASSWORD_COMPLEXITY} = constant
const modelKey = 'accounts/manage'

const { TextArea } = Input
const FormItem = Form.Item

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
}

class AddAccount extends Base {
  constructor(props) {
    super(props)

  }

  render() {
    const manageType = cache.get('manageType')
    // console.log(manageType)

    const { manage, dispatch, form } = this.props

    const { accountName, accountPassword, accountPasswordConfirmation, accountRemark, keys, databases, permissions } = manage

    const { getFieldDecorator, validateFields, getFieldsValue, setFieldsValue } = form

    const next = () => {

      validateFields((err, values) => {
        // console.log(err, values)
        if (err) {
          return false
        }
        const data = {
          ...getFieldsValue()
        }
        // console.log('data==>', data)
        dispatch({
          type: `${modelKey}/setFormData`,
          payload: data
        })
        dispatch({
          type: `${modelKey}/plusCurrentStep`
        })
      })
    }
    // console.log(manageType)

    const checkName = (rule, value, callback) => {
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

    const checkPass = (rule, value, callback) => {
      if (!value) {
        callback();
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

    const checkConfirm = (rule, value, callback) => {
      if (!value) {
        callback();
      }
      else {
        let password = this.props.form.getFieldValue('accountPassword')
        if(value !== password){
          callback ([new Error("密码不一致，请重新输入")])
        }
        callback()
      }
    }

    const changePassword = (e) => {
      this.props.form.validateFields(['accountPasswordConfirmation'], { force: true })
    }

    const dynamicFieldSetProps = {
      form,
      keys,
      databases,
      permissions,
      checkName
    }

    const grantDbLabel = (
      <span>
        <span className="star">*</span>
        <span>授权数据库（全部则填*）</span>
      </span>
    )

    return (
      <Form className={styles["create"]}>
        <FormItem {...formItemLayout} label="账号名">
          {getFieldDecorator('accountName', {
            initialValue: accountName,
            rules: [{
              required: true,
              message: '请输入数据库账号',
              whitespace: true,
            }, {
              validator: checkName
            }]
          })(
            <Input placeholder="请输入数据库账号" />
          )}
        </FormItem>
        {(manageType === 1 || manageType === 4 || manageType === 5) && (
          <FormItem {...formItemLayout} label={grantDbLabel}>
            {getFieldDecorator('grantDb', {
              rules: [{
                required: false,
                message: '请输入授权数据库',
              }],
            })(
              <span></span>
            )}
            <DynamicFieldSet {...dynamicFieldSetProps}/>
          </FormItem>
        )
        }
        {(manageType === 1 || manageType === 3) && (
          <div>
            <FormItem {...formItemLayout} label="密码">
              {getFieldDecorator('accountPassword', {
                initialValue: accountPassword,
                onChange: changePassword,
                rules: [{
                  required: true,
                  message: '请输入密码',
                },
                {
                  validator: checkPass
                }],
              })(
                <Input type="password" placeholder="请输入密码" />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="确认密码">
              {getFieldDecorator('accountPasswordConfirmation', {
                initialValue: accountPasswordConfirmation,
                rules: [{
                  required: true,
                  message: '请输入确认密码',
                }, {
                  validator: checkConfirm
                }],
              })(
                <Input type="password" placeholder="请输入确认密码" />
              )}
            </FormItem>
          </div>
        )
        }
        <FormItem {...formItemLayout} label="备注说明">
          {getFieldDecorator('accountRemark', {
            initialValue: accountRemark,
            rules: [{
              required: false,
              message: '请输入备注说明',
            }],
          })(
            <TextArea rows={4} placeholder="请输入备注说明" />
          )}
        </FormItem>
        <Row className="mgt-16 text-right">
          <Button type="primary" onClick={next}>下一步</Button>
        </Row>
      </Form>
    )
  }
}

function mapStateToProps(state) {
  return {
    manage: state['accounts/manage'],
    loading: state.loading.effects
  }
}

AddAccount.propTypes = {
  manage: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default Form.create({})(connect(mapStateToProps)(AddAccount))
