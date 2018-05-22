/**
 * Created by zhangmm on 2017/8/18.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './edit.less'
import { DataTable, Filter, IconFont } from 'components'
import { Row , Form, Input, Button, Select, Tag } from 'antd'
import { constant } from 'utils'
const {NAME_COMPLEXITY} = constant
const { TextArea } = Input
const FormItem = Form.Item
const Option = Select.Option

class Edit extends Base{
  constructor(props){
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.checkName = this.checkName.bind(this)
    //设置返回按钮
    this.setGobackBtn()
    //返回时清空输入域里的值
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '角色编辑', selectedKey: '角色管理role'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.push({
      type:"editRole/handleReset"
    })
  }

  handleSubmit = (e) =>{
    e.preventDefault()
    //获取路由的id
    const id = this.props.match.params.id
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      let permissions = []
      this.props.edit.permissions.map((val1,key1) =>{
        values['permissions'].map((val2,key2) =>{
          if(val1.display_name === val2){
            permissions.push(val1.id)
          }
        })
      })
      delete values['permissions']
      const data = {
        permissions:permissions,
        ...values
      }
      this.props.dispatch({type:'editRole/handleRecommit',payload:{recommit:true}})
      this.props.dispatch({
        type:"editRole/editRole",
        payload:data,
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

  render(){
    const { location, dispatch, edit, form } = this.props
    const { getFieldDecorator } = form
    const { name, description, permissions, initPermissions, recommit } = edit

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
      <Row className={styles.edit}>
        <Row className="inner-cont">
          <Form onSubmit={this.handleSubmit}>
            <FormItem label="角色名称:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('name', {
                initialValue : name,
                rules: [{
                  required: true,
                  message: '请输入角色名称',
                },{
                  validator: this.checkName
                }],
              })(
                <Input placeholder="角色名称"/>
              )}
            </FormItem>
            <FormItem label="权限:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('permissions',{
                initialValue : initPermissions,
                rules: [{
                  required: false,
                  message: '请选择权限',
                }],
              })(
                <Select mode="multiple" placeholder="请选择权限">
                  {
                    permissions.map((data) => {
                      let icon_content = data.level === 1 ? <IconFont type="iconfont-gaoji" className="icon"/> : ''
                      return (<Option key={data.id} value={data.display_name+''} title={data.display_name}>
                          {icon_content}{data.display_name}
                        </Option>)
                      return (<Option key={data.id} value={data.id+''} title={data.display_name}>
                        {icon_content}{data.display_name}
                      </Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label="备注:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('description',{
                initialValue : description,
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

Edit.propTypes = {
  edit: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    edit: state['editRole'],
    loading: state.loading.effects,
  }
})(Form.create()(Edit))
