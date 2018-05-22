/**
 * Created by zhangmm on 2017/9/2.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './edit.less'
import { DataTable, Filter, IconFont } from 'components'
import { Link } from 'dva/router'
import { Col, Row , Form, Input, Button, Select, Modal, Icon } from 'antd'
import { constant } from 'utils'
const {NAME_COMPLEXITY} = constant

const { TextArea } = Input
const FormItem = Form.Item
const Option = Select.Option
const confirm = Modal.confirm

class Edit extends Base{
  constructor(props){
    super(props)
    //设置返回按钮
    this.setGobackBtn()
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: "业务编辑", selectedKey: '业务管理business'},
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
      type:"editBusiness/handleReset"
    })

    this.handleSubmit = this.handleSubmit.bind(this)
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
      this.props.dispatch({type:'editBusiness/handleRecommit',payload:{recommit:true}})
      this.props.dispatch({
        type:"editBusiness/editBusiness",
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

  render(){
    const { location, dispatch, edit, form } = this.props
    const { getFieldDecorator } = form
    const { name, desc, users, user_id, level, recommit } = edit

    const isSuperUser = level === 0 ? true : false
    const display = isSuperUser ? 'show' : 'hide'

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
            <FormItem label="业务名称:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('name', {
                initialValue : name,
                rules: [{
                  required: true,
                  message: '请输入业务名称',
                },{
                  validator: this.checkName
                }],
              })(
                <Input placeholder="业务名称"/>
              )}
            </FormItem>
            <FormItem label="负责人:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('user_id',{
                initialValue : user_id === 0 ? undefined : user_id + '',
                rules: [{
                  required: true,
                  message: '请选择负责人',
                }],
              })(
                <Select placeholder="请选择负责人" disabled={isSuperUser}>
                  {
                    users.map((data) => {
                      return (<Option key={data.id} value={data.id+''}>{data.user_name}</Option>)
                    })
                  }
                </Select>
              )}
              <Row className={display}>
                <Icon type="exclamation-circle" className="text-warning pad-15"/>
                <span>非高权用户，无法指定负责人</span>
              </Row>
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
              <Button type="primary" htmlType="submit" className="margin-but" loading={recommit}>保存</Button>
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
    edit: state['editBusiness'],
    loading: state.loading.effects,
  }
})(Form.create()(Edit))
