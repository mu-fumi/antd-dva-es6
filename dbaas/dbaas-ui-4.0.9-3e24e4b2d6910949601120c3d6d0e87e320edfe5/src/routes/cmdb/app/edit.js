/**
 * Created by zhangmm on 2017/9/1.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './edit.less'
import { DataTable, Filter, IconFont } from 'components'
import { Link } from 'dva/router'
import { Col, Row , Form, Input, Button, Select,Modal } from 'antd'
const { TextArea } = Input
const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm
import { constant } from 'utils'
const {NAME_COMPLEXITY} = constant

class Edit extends Base{
  constructor(props){
    super(props)
    //设置返回按钮
    this.setGobackBtn()
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: "应用编辑", selectedKey: '应用管理application'},
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
      type:"editApp/handleReset"
    })

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleAppDelete = this.handleAppDelete.bind(this)
    this.checkName = this.checkName.bind(this)
  }

  handleSubmit = (e) =>{
    e.preventDefault()
    //获取路由的id
    const id = this.props.match.params.id
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      this.props.dispatch({type:'editApp/handleRecommit',payload:{recommit:true}})
      this.props.dispatch({
        type:"editApp/editApp",
        payload:values,
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

  handleAppDelete(){
    const name = this.props.edit.name
    const id = this.props.match.params.id
    confirm({
      title : '提示',
      content : `确定要删除${name}应用吗？`,
      onOk : () => {
        this.props.dispatch({
          type : `editApp/deleteApp`,
          payload : {
            id : id
          }
        })
      }
    })
  }


  render(){
    const { location, dispatch, edit, form } = this.props
    const { getFieldDecorator } = form
    const { name, desc, users, user_id, businesses, business_id, recommit } = edit

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
            <FormItem label="应用名称:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('name', {
                initialValue : name,
                rules: [{
                  required: true,
                  message: '请输入应用名称',
                },{
                  validator: this.checkName
                }],
              })(
                <Input placeholder="应用名称"/>
              )}
            </FormItem>
{/*            <FormItem label="用户:"  {...formItemLayout}>
              {getFieldDecorator('user_id',{
                initialValue : user_id + '',
                rules: [{
                  required: false,
                  message: '请选择用户',
                }],
              })(
                <Select placeholder="请选择用户">
                  {
                    users.map((data) => {
                      return (<Option key={data.id} value={data.id+''}>{data.user_name}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>*/}
            <FormItem label="业务:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('business_id',{
                initialValue : business_id === null ? '' : business_id + '',
                rules: [{
                  required: true,
                  message: '请选择业务',
                }],
              })(
                <Select placeholder="请选择业务">
                  {
                    businesses.map((data) => {
                      return (<Option key={data.id} value={data.id+''}>{data.name}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label="备注:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('desc',{
                initialValue : desc,
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
    edit: state['editApp'],
    loading: state.loading.effects,
  }
})(Form.create()(Edit))
