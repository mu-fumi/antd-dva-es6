/**
 * Created by zhangmm on 2017/8/28.
 * 添加 sql发布权限 项，by lizzy on 2017/9/12.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './edit.less'
import { DataTable, Filter, IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Form, Input, Button, Select, Icon } from 'antd'
import PermissionModal from './permissionModal'
import { constant } from 'utils'
const {NAME_COMPLEXITY, PRIVILEGES, PASSWORD_COMPLEXITY} = constant

const FormItem = Form.Item
const Option = Select.Option

class Edit extends Base{
  constructor(props){
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.checkPass = this.checkPass.bind(this)
    this.checkName = this.checkName.bind(this)
    this.checkConfirm = this.checkConfirm.bind(this)
    this.changePassword = this.changePassword.bind(this)
    //设置返回按钮
    this.setGobackBtn()
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '用户编辑', selectedKey: '用户管理user'},
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
      type:"editUser/handleReset"
    })
    this.state={
      conf_pass_validate:false//动态校验确认密码
    }
  }

  handleSubmit = (e) =>{
    e.preventDefault()
    //获取路由的id
    const id = this.props.match.params.id
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      if(!values['password'] && !values['conf_password']){
        delete values['password']
        delete values['conf_password']
      }else if(values['password'] && values['conf_password']){
        delete values['conf_password']
      }
      this.props.dispatch({type:'editUser/handleRecommit',payload:{recommit:true}})
      this.props.dispatch({
        type:"editUser/editUser",
        payload: {...values, 'sql-publish-permissions': PRIVILEGES.join(', ') === this.props.edit.selectedPermissions ?
          'ALL' : this.props.edit.selectedPermissions},
        id: id
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

  checkPass (rule, value, callback) {
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

  checkConfirm (rule, value, callback) {
    if (!value) {
      callback();
    }
    else {
      let password = this.props.form.getFieldValue('password')
      if(value !== password){
        callback ([new Error("密码不一致，请重新输入")])
      }
      callback()
    }
  }

  changePassword (e) {
    let password = e.target.value
    if(!password){
      this.setState({
        conf_pass_validate:false,
      },() => {
        this.props.form.validateFields(['conf_password'], { force: true })
      })
      this.props.form.setFieldsValue({
        conf_password:undefined
      })
    }else{
      this.setState({
        conf_pass_validate:true,
      },() => {
        this.props.form.validateFields(['conf_password'], { force: true })
      })
    }
  }



  render(){
    const { location, dispatch, edit, form } = this.props
    const { getFieldDecorator } = form
    const { visible, selectedPermissions, recommit } = edit
    //显示隐藏新建角色span
    const display = edit.roles.length === 0 ? {display: ''} : {display: 'none'}

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

    const handleModalOk = (selectedPermissions) => {
      dispatch({
        type: "editUser/handleSelectedPermissions",
        payload: selectedPermissions,
      })
      dispatch({
        type: "editUser/handleModalVisible",
        payload: false,
      })
    }

    const handleModalCancel = () => {
      dispatch({
        type: "editUser/handleModalVisible",
        payload: false,
      })
    }

    const selectPermissions = () => {
      dispatch({
        type: "editUser/handleModalVisible",
        payload: true,
      })
    }

    const permissionModalProps = {
      onOk: handleModalOk,
      onCancel: handleModalCancel,
      visible: visible,
      selectedPermissions: selectedPermissions || ''
    }

    return(
      <Row className={styles.edit}>
        <Row className="inner-cont">
          <Form onSubmit={this.handleSubmit}>
            <FormItem label="用户名:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('user_name', {
                initialValue:edit.user_name,
                rules: [{
                  required: true,
                  message: '请输入用户名',
                },{
                  validator: this.checkName
                }],
              })(
                <Input placeholder="用户名" disabled={true}/>
              )}
            </FormItem>
            <FormItem label="邮箱:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('email',{
                initialValue:edit.email,
                rules: [{
                  required: true,
                  message: '请输入邮箱',
                },
                  {
                    pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                    message: '请输入正确的邮箱地址'
                  }],
              })(
                <Input placeholder="邮箱" disabled={true}/>
              )}
            </FormItem>
            <FormItem label="昵称:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('nick_name',{
                initialValue:edit.nick_name,
                rules: [{
                  required: true,
                  message: '请输入昵称',
                },{
                  validator: this.checkName
                }],
              })(
                <Input placeholder="昵称"/>
              )}
            </FormItem>
            <FormItem label="密码:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('password',{
                initialValue:edit.password,
                onChange:this.changePassword,
                rules: [{
                  required: false,
                  message: '请输入密码',
                },
                {
                  validator: this.checkPass
                }],
              })(
                <Input type="password" placeholder="密码" autoComplete="new-password"/>
              )}
            </FormItem>
            <FormItem label="确认密码:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('conf_password',{
                initialValue:edit.password,
                rules: [{
                  required: this.state.conf_pass_validate,//动态校验
                  message: '请确认密码',
                },
                {
                  validator: this.checkConfirm
                }],
              })(
                <Input type="password" placeholder="确认密码" autoComplete="new-password"/>
              )}
            </FormItem>
            <FormItem label="角色:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('role_id',{
                initialValue:edit.role_id + '',
                rules: [{
                  required: true,
                  message: '请输入角色',
                }],
              })(
                <Select placeholder="请选择角色" hasFeedback>
                  {
                    edit.roles.map((data) => {
                      return (<Option key={data.id} value={data.id+''}>{data.display_name}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <div className="role-icon" style={display}>
              <Icon type="exclamation-circle" className="text-warning pad-10"/>
              <span className="pad-10">
                角色列表为空,请 <Link to="/cmdb/role/add">新建角色</Link>
              </span>
            </div>
            <FormItem label="状态:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('active',{
                initialValue:edit.active +'',
                rules: [{
                  required: true,
                  message: '请选择状态',
                }],
              })(
                <Select placeholder="请选择状态">
                  <Option key="1" value="1">正常</Option>
                  <Option key="0" value="0">禁用</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="SQL 发布权限:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('sql-publish-permissions',{
                rules: [{
                  required: false,
                  message: '请选择 SQL 发布权限',
                }],
              })(
                <span>{selectedPermissions}</span>
              )}
              <div>
                <Button onClick={selectPermissions}>
                  <IconFont type="plus"/>
                  管理权限
                </Button>
              </div>
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit" className="margin-but" loading={recommit}>确定</Button>
            </FormItem>
          </Form>
        </Row>
        <PermissionModal {...permissionModalProps} />
      </Row>
    )
  }
}

Edit.propTypes = {
  edit: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    edit: state['editUser'],
    loading: state.loading.effects,
  }
})(Form.create()(Edit))
