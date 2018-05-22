/**
 * Created by zhangmm on 2017/8/28.
 * 添加 sql发布权限 项，by lizzy on 2017/9/12.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './add.less'
import { DataTable, Filter, IconFont } from 'components'
import { Row , Form, Input, Button, Select } from 'antd'
import PermissionModal from './permissionModal'
import { constant } from 'utils'
const {NAME_COMPLEXITY, PRIVILEGES, PASSWORD_COMPLEXITY} = constant

const Option = Select.Option
const FormItem = Form.Item

class Add extends Base{
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
      payload: {activeName: '用户新增', selectedKey: '用户管理user'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.state={
      conf_pass_validate:false//动态校验确认密码
    }
  }

  componentWillMount(){
    this.props.dispatch({
      type:"addUser/getRoles",
      payload:{
        paging:0
      }
    })
  }

  handleSubmit = (e) =>{
    e.preventDefault()
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
      this.props.dispatch({type:'addUser/handleRecommit',payload:{recommit:true}})
      this.props.dispatch({
        type:"addUser/addUser",
        payload: {...values, 'sql-publish-permissions': PRIVILEGES.join(', ') === this.props.add.selectedPermissions ?
          'ALL' : this.props.add.selectedPermissions}
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
    const { location, dispatch, add, form } = this.props
    const { getFieldDecorator } = form
    const { roles, visible, selectedPermissions, recommit } = add
    const handleModalOk = (selectedPermissions) => {
      dispatch({
        type: "addUser/handleSelectedPermissions",
        payload: selectedPermissions,
      })
      dispatch({
        type: "addUser/handleModalVisible",
        payload: false,
      })
    }

    const handleModalCancel = () => {
      dispatch({
        type: "addUser/handleModalVisible",
        payload: false,
      })
    }

    const selectPermissions = () => {
      dispatch({
        type: "addUser/handleModalVisible",
        payload: true,
      })
    }

    const permissionModalProps = {
      onOk: handleModalOk,
      onCancel: handleModalCancel,
      visible: visible,
      selectedPermissions: PRIVILEGES.join(', ')  //  开始默认全选
    }

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
      <Row className={styles.add}>
        <Row className="inner-cont">
          <Form onSubmit={this.handleSubmit}>
            <FormItem label="用户名:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('user_name', {
                rules: [{
                  required: true,
                  message: '请输入用户名',
                },{
                  validator: this.checkName
                }],
              })(
                <Input placeholder="用户名"/>
              )}
            </FormItem>
            <FormItem label="邮箱:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('email',{
                rules: [{
                  required: true,
                  message: '请输入邮箱',
                },
                {
                  pattern: /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                  message: '请输入正确的邮箱地址'
                }],
              })(
                <Input placeholder="邮箱"/>
              )}
            </FormItem>
            <FormItem label="昵称:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('nick_name',{
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
                rules: [{
                  required: true,
                  message: '请选择角色',
                }],
              })(
                <Select placeholder="请选择角色" hasFeedback>
                  {
                    roles.map((data) => {
                      return (<Option key={data.id} value={data.id+''}>{data.display_name}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label="状态:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('active',{
                rules: [{
                  required: true,
                  message: '请输入状态',
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

Add.propTypes = {
  add: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    add: state['addUser'],
    loading: state.loading.effects,
  }
})(Form.create()(Add))
