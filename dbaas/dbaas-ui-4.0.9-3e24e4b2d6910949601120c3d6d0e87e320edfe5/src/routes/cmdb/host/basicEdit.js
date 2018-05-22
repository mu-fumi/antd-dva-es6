/**
 * Created by zhangmm on 2017/8/22.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './basicEdit.less'
import { DataTable, Filter } from 'components'
import { Link } from 'dva/router'
import { Row , Form, Input, Button, message, Select, Tooltip, Icon } from 'antd'

const Option = Select.Option
const FormItem = Form.Item

let MySQL_label = (<Tooltip placement='left' title={<span>单个MySQL实例内存</span>}>
  <Icon type='info-circle' className='text-warning'/>MySQL内存:
</Tooltip>)
let connect_type_label = (<Tooltip placement='left' title={<span>目前仅支持 ssh、saltstack</span>}>
  <Icon type='info-circle' className='text-warning'/>连接方式:
</Tooltip>)

class BasicEdit extends Base{
  constructor(props){
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSelectChange = this.handleSelectChange.bind(this)
    this.handleSelectMultiChange = this.handleSelectMultiChange.bind(this)
    //设置返回按钮
    this.setGobackBtn()
    //返回时清空输入域里的值
    this.push({
      type:"basicEditHost/handleReset"
    })
  }

  handleSubmit = (e) =>{
    e.preventDefault()
    //获取路由的id
    const id = this.props.params.id
    //将model里的参数都传给服务端
    const params = this.props.edit.params
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      this.props.dispatch({
        type:"basicEditHost/editHost",
        payload:params,
        id: id
      })
    })
  }

  handleInputChange(key,e){
    this.props.dispatch({
      type:'basicEditHost/handleHostParams',
      payload:{
        [key]:e.target.value
      }
    })
  }

  handleSelectChange(key,value){
    this.props.dispatch({
      type:'basicEditHost/handleHostParams',
      payload:{
        [key]:value
      }
    })
  }

  handleSelectMultiChange(key,value){
    const tag = value.join(',')
    this.props.dispatch({
      type:'basicEditHost/handleHostParams',
      payload:{
        [key]:tag
      }
    })
  }


  render(){
    const { location, dispatch, basicEdit, form } = this.props
    const { getFieldDecorator } = form
    const { params, city, idc } = basicEdit

    const cityList = !city ? [] : JSON.parse(city)
    const idcList = !idc ? [] : JSON.parse(idc)
    const tagList = params.tag ? params.tag.split(',') : []

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
      <Row className={styles.basicEdit}>
        <Row className="inner-cont">
          <Form onSubmit={this.handleSubmit}>
            <FormItem label="主机名:"  {...formItemLayout}>
              {getFieldDecorator('host_name',{
                initialValue : params.host_name,
                rules: [{
                  required: false,
                  message: '请输入主机名',
                }],
              })(
                <Input disabled={true} placeholder="主机名"/>
              )}
            </FormItem>
            <FormItem label="主机类型:"  {...formItemLayout}>
              {getFieldDecorator('type',{
                initialValue : params.type,
                rules: [{
                  required: false,
                  message: '请输入主机类型',
                }],
              })(
                <Input placeholder="主机类型"/>
              )}
            </FormItem>
            <FormItem label="状态:"  {...formItemLayout}>
              {getFieldDecorator('connect_status',{
                initialValue : params.connect_status,
                rules: [{
                  required: false,
                  message: '请输入状态',
                }],
              })(
                <Input placeholder="状态"/>
              )}
            </FormItem>
            <FormItem label="处理人:"  {...formItemLayout}>
              {getFieldDecorator('processor',{
                initialValue : params.processor,
                rules: [{
                  required: false,
                  message: '请输入处理人',
                }],
              })(
                <Input placeholder="处理人"/>
              )}
            </FormItem>
            <FormItem label="内存:"  {...formItemLayout}>
              {getFieldDecorator('real_memory',{
                initialValue : params.real_memory,
                onChange:this.handleInputChange.bind(this,'real_memory'),
                rules: [{
                  required: true,
                  message: '请输入内存',
                }],
              })(
                <Input placeholder="内存" addonAfter='单位：G'/>
              )}
            </FormItem>
            <FormItem label="操作系统版本:"  {...formItemLayout}>
              {getFieldDecorator('os_version',{
                initialValue : params.os_version,
                onChange:this.handleInputChange.bind(this,'os_version'),
                rules: [{
                  required: true,
                  message: '请输入操作系统版本',
                }],
              })(
                <Input placeholder="操作系统版本"/>
              )}
            </FormItem>
            <FormItem label="Agent 状态:"  {...formItemLayout}>
              {getFieldDecorator('agent_status',{
                initialValue : params.agent_status,
                onChange:this.handleInputChange.bind(this,'agent_status'),
                rules: [{
                  required: true,
                  message: '请输入Agent 状态',
                }],
              })(
                <Input placeholder="Agent 状态"/>
              )}
            </FormItem>
            <FormItem label="用户名:"  {...formItemLayout}>
              {getFieldDecorator('user_name',{
                initialValue : params.user_name,
                onChange:this.handleInputChange.bind(this,'user_name'),
                rules: [{
                  required: true,
                  message: '请输入用户名',
                }],
              })(
                <Input placeholder="用户名"/>
              )}
            </FormItem>
{/*            <FormItem label={MySQL_label}  {...formItemLayout}>
              {getFieldDecorator('db_memory',{
                initialValue : params.db_memory,
                onChange:this.handleInputChange.bind(this,'db_memory'),
                rules: [{
                  required: false,
                  message: '请输入MySQL内存',
                }],
              })(
                <Input placeholder="MySQL内存" addonAfter='单位：G'/>
              )}
            </FormItem>*/}
{/*            <FormItem label="网卡:"  {...formItemLayout}>
              {getFieldDecorator('eth_interface',{
                initialValue : params.eth_interface,
                onChange:this.handleInputChange.bind(this,'eth_interface'),
                rules: [{
                  required: false,
                  message: '请输入网卡',
                }],
              })(
                <Input placeholder="网卡 如eth0"/>
              )}
            </FormItem>*/}
            <FormItem label="城市:"  {...formItemLayout}>
              {getFieldDecorator('city',{
                initialValue : params.city,
                onChange:this.handleSelectChange.bind(this,'city'),
                rules: [{
                  required: true,
                  message: '请选择城市',
                }],
              })(
                <Select placeholder="请选择城市">
                  {cityList.map((data) => {
                    return (<Option key={data} value={data+''}>{data}</Option>)
                  })}
                </Select>
              )}
            </FormItem>
{/*            <FormItem label="数据中心:"  {...formItemLayout}>
              {getFieldDecorator('idc',{
                initialValue : params.idc,
                onChange:this.handleSelectChange.bind(this,'idc'),
                rules: [{
                  required: true,
                  message: '请选择数据中心',
                }],
              })(
                <Select placeholder="请选择数据中心">
                  {idcList.map((data) => {
                    return (<Option key={data} value={data+''}>{data}</Option>)
                  })}
                </Select>
              )}
            </FormItem>*/}
{/*            <FormItem label="优先级:"  {...formItemLayout}>
              {getFieldDecorator('priority',{
                initialValue : params.priority,
                onChange:this.handleInputChange.bind(this,'priority'),
                rules: [{
                  required: true,
                  message: '请输入优先级',
                }],
              })(
                <Input type='number' placeholder="优先级"/>
              )}
            </FormItem>
            <FormItem label="权重:"  {...formItemLayout}>
              {getFieldDecorator('weight',{
                initialValue : params.weight,
                onChange:this.handleInputChange.bind(this,'weight'),
                rules: [{
                  required: true,
                  message: '请输入权重',
                }],
              })(
                <Input type='number' placeholder="权重"/>
              )}
            </FormItem>*/}
{/*            <FormItem label={connect_type_label}  {...formItemLayout}>
              {getFieldDecorator('connect_type',{
                initialValue : params.connect_type,
                onChange:this.handleInputChange.bind(this,'connect_type'),
                rules: [{
                  required: false,
                  message: '请输入连接方式',
                }],
              })(
                <Input placeholder="连接方式 如ssh"/>
              )}
            </FormItem>*/}
            <FormItem label="标签:"  {...formItemLayout}>
              {getFieldDecorator('tag',{
                initialValue : tagList,
                onChange:this.handleSelectMultiChange.bind(this,'tag'),
                rules: [{
                  required: false,
                  message: '请选择标签',
                }],
              })(
                <Select mode="multiple"  placeholder="请选择标签">
                  {window.DS.TAG.map((data) => {
                    return (<Option key={data} value={data+''}>{data}</Option>)
                  })}
                </Select>
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

BasicEdit.propTypes = {
  basicEdit: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    basicEdit: state['basicEditHost'],
    loading: state.loading.effects,
  }
})(Form.create()(BasicEdit))
