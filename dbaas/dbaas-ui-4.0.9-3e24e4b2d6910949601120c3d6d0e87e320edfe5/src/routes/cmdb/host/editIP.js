/**
 * Created by zhangmm on 2017/8/22.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './editIP.less'
import { DataTable, Filter } from 'components'
import { Link } from 'dva/router'
import { Row , Form, Input, Button, message } from 'antd'

const FormItem = Form.Item

class EditIP extends Base{
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.isIP = this.isIP.bind(this)
    //设置返回按钮
    this.setGobackBtn()
    //返回时清空输入域里的值
    this.push({
      type: "editHostIP/handleReset"
    })
    //用来遍历的keys,只有七个，没有admin_ip2和admin_vip2
    this.state = {
      keys: [
        'business_ip1',
        'business_ip2',
        'business_vip1',
        'business_vip2',
        'admin_ip1',
        'admin_vip1',
        'connect_ip'
      ]
    }
  }

  handleSubmit = (e) =>{
    e.preventDefault()
    //控制跳出循环
    let state = false
    //获取路由的id
    const name = this.props.params.name
    //将model里的参数都传给服务端
    const paramIP = this.props.editIP.paramIP
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      if ( !values['admin_ip'] && !values['business_ip1'] ) {
        message.error('业务IP1 或 管理VIP 必须填写一个')
        return false
      }
      this.state.keys.forEach((key) => {
        if (state) {
          return
        }
        if (paramIP[key]  && !this.isIP(paramIP[key])) {
          message.error(paramIP[key] + ' 不是 IP 地址')
          state = true
          return false
        }
        if(key !=='connect_ip' ){
          this.state.keys.forEach((k) => {
            if (key !== k && k !=='connect_ip' && paramIP[key]  && (paramIP[key] === paramIP[k])) {
              message.error(paramIP[key] + ' 重复, 请检查')
              state = true
              return
            }
          })
        }
      })
      if (state) {
        return false
      }
      this.props.dispatch({
        type:"editHostIP/editHostIP",
        payload:paramIP,
        name: name
      })
    })
  }

  handleInputChange(key,e){
    this.props.dispatch({
      type:'editHostIP/handleHostParam',
      payload:{
        [key]:e.target.value
      }
    })
  }

  isIP(ip) {
    let re = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    return re.test(ip)
  }


  render(){
    const { location, dispatch, editIP, form } = this.props
    const { getFieldDecorator } = form
    const { paramIP } = editIP

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
      <Row className={styles.editIP}>
        <Row className="inner-cont">
          <Form onSubmit={this.handleSubmit}>
            <FormItem label="机器名:"  {...formItemLayout}>
              <span>{paramIP.host_name}</span>
            </FormItem>
            <FormItem label="业务IP1:"  {...formItemLayout}>
              {getFieldDecorator('business_ip1',{
                initialValue : paramIP.business_ip1,
                onChange:this.handleInputChange.bind(this,'business_ip1'),
                rules: [{
                  required: false,
                  message: '请输入业务IP1',
                }],
              })(
                <Input placeholder="业务IP1"/>
              )}
            </FormItem>
            <FormItem label="业务IP2:"  {...formItemLayout}>
              {getFieldDecorator('business_ip2',{
                initialValue : paramIP.business_ip2,
                onChange:this.handleInputChange.bind(this,'business_ip2'),
                rules: [{
                  required: false,
                  message: '请输入业务IP2',
                }],
              })(
                <Input placeholder="业务IP2"/>
              )}
            </FormItem>
            <FormItem label="业务VIP1:"  {...formItemLayout}>
              {getFieldDecorator('business_vip1',{
                initialValue : paramIP.business_vip1,
                onChange:this.handleInputChange.bind(this,'business_vip1'),
                rules: [{
                  required: false,
                  message: '请输入业务VIP1',
                }],
              })(
                <Input placeholder="业务VIP1"/>
              )}
            </FormItem>
            <FormItem label="业务VIP2:"  {...formItemLayout}>
              {getFieldDecorator('business_vip2',{
                initialValue : paramIP.business_vip2,
                onChange:this.handleInputChange.bind(this,'business_vip2'),
                rules: [{
                  required: false,
                  message: '请输入业务VIP2',
                }],
              })(
                <Input placeholder="业务VIP2"/>
              )}
            </FormItem>
            <FormItem label="管理IP:"  {...formItemLayout}>
              {getFieldDecorator('admin_ip1',{
                initialValue : paramIP.admin_ip1,
                onChange:this.handleInputChange.bind(this,'admin_ip1'),
                rules: [{
                  required: false,
                  message: '请输入管理IP',
                }],
              })(
                <Input placeholder="管理IP"/>
              )}
            </FormItem>
            <FormItem label="管理VIP:"  {...formItemLayout}>
              {getFieldDecorator('admin_vip1',{
                initialValue : paramIP.admin_vip1,
                onChange:this.handleInputChange.bind(this,'admin_vip1'),
                rules: [{
                  required: false,
                  message: '请输入管理VIP',
                }],
              })(
                <Input placeholder="管理VIP"/>
              )}
            </FormItem>
            <FormItem label="SSH IP:"  {...formItemLayout}>
              {getFieldDecorator('connect_ip',{
                initialValue : paramIP.connect_ip,
                onChange:this.handleInputChange.bind(this,'connect_ip'),
                rules: [{
                  required: true,
                  message: '请输入SSH IP',
                }],
              })(
                <Input placeholder="SSH IP"/>
              )}
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit" className="margin-but">确定</Button>
            </FormItem>
          </Form>
        </Row>
      </Row>
    )
  }
}

EditIP.propTypes = {
  editIP: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    editIP: state['editHostIP'],
    loading: state.loading.effects,
  }
})(Form.create()(EditIP))
