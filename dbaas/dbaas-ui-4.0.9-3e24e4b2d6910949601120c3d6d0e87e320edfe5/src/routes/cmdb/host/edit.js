/**
 * Created by zhangmm on 2017/8/22.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './edit.less'
import { DataTable, Filter, IconFont } from 'components'
import { Row , Form, Input, Button, Switch, Select, Collapse, Tooltip, Col, Icon, message, InputNumber  } from 'antd'
import { classnames, constant } from 'utils'
import { Link } from 'dva/router'
const { HOST_TWO_TYPE, PASSWORD_COMPLEXITY } = constant

const Panel = Collapse.Panel;
const Option = Select.Option;
const FormItem = Form.Item;

let city_label = (<Tooltip placement='left' title={<span>支持手动输入城市名</span>}>
  <Icon type='info-circle' className={classnames('text-warning','marr-3')}/>城市
</Tooltip>)
let idc_label = (<Tooltip placement='left' title={<span>支持手动输入数据中心名</span>}>
  <Icon type='info-circle' className={classnames('text-warning','marr-3')}/>数据中心
</Tooltip>)

// 装三种类型的数组
// 存放IP 属性
let ipTexts = ['business_ip1','business_ip2', 'business_vip1', 'business_vip2', 'admin_ip1', 'admin_vip1', 'connect_ip'];
// 存放显示凭证 属性
let certificateTexts = ['root_name', 'root_password', 'user_name', 'user_password', 'connect_port', 'remember_token'];
// 存放显示自动可发现 属性
let attributeTexts = ['os_arch', 'os_kernel', 'os_version', 'mounts', 'processor', 'interfaces'];
let errorTexts = [];

class Edit extends Base{
  constructor(props){
    super(props);

    //设置返回按钮
    this.setGobackBtn();
    //返回时清空输入域里的值
    this.push({
      type:"editHost/handleReset"
    })
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '主机编辑', selectedKey: '主机管理host'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSelectChange = this.handleSelectChange.bind(this)
    this.handleSelectMultiChange = this.handleSelectMultiChange.bind(this)
    /*this.handleInputType = this.handleInputType.bind(this)*/
    this.handleIdcChange = this.handleIdcChange.bind(this)
    this.handleCityChange = this.handleCityChange.bind(this)
    this.changeIPText = this.changeIPText.bind(this)
    this.changeCertificateText = this.changeCertificateText.bind(this)
    this.isIP = this.isIP.bind(this)
    this.isPort = this.isPort.bind(this)
    this.checkIP = this.checkIP.bind(this)
    this.checkPort = this.checkPort.bind(this)
    this.changeAttributeText = this.changeAttributeText.bind(this)
    this.checkPass = this.checkPass.bind(this)
  }

  handleSubmit = (e) =>{
    e.preventDefault()
    //获取路由的id
    const id = this.props.match.params.id
    //将model里的参数都传给服务端
    this.props.form.validateFields((err, values) => {
      if(err){
        // 每次添加内容时都要清空数组，需要最新的数组。 当错误处理完后需要清除。
        errorTexts = [];
        //对象转成数组
        errorTexts.push(Object.keys(err)[0]);
        console.log(errorTexts)
        if(ipTexts.indexOf(errorTexts[0]) !== -1){
          this.changeIPText();
        }else if(certificateTexts.indexOf(errorTexts[0]) !== -1) {
          this.changeCertificateText();
        }else if(attributeTexts.indexOf(errorTexts[0]) !== -1) {
          this.changeAttributeText();
        }
        return false;
      }
      if ( !values['admin_ip'] && !values['business_ip1'] ) {
        message.error('业务 IP1 或管理 VIP 必须填写一个')
        return false
      }
      //如果修改的时候不输入密码，则不传该字段
      if(!values['root_password']){
        delete values['root_password']
      }
      if(!values['user_password']){
        delete values['user_password']
      }
      if(!values['remember_token']){
        delete values['remember_token']
      }
      if(!values['weight']){
        values['weight'] = 0
      }
      if(!values['priority']){
        values['priority'] = 0
      }
      //获取idc、city
      const data = {
        ...values,
        idc:values['idc'].join(','),
        city:values['city'].join(','),
      }
      this.props.dispatch({
        type:'editHost/handleRecommit',
        payload:{
          recommit:true
        }
      });
      this.props.dispatch({
        type:"editHost/editHost",
        payload:data,
        id: id
      })
    })
  }

  handleInputChange(key,e){
    this.props.dispatch({
      type:'editHost/handleHostParams',
      payload:{
        [key]:e.target.value
      }
    })
  }

  handleSelectChange(key,value){
    this.props.dispatch({
      type:'editHost/handleHostParams',
      payload:{
        [key]:value
      }
    })
  }

  handleSelectMultiChange(key,value){
    const tag = value.join(',')
    this.props.dispatch({
      type:'editHost/handleHostParams',
      payload:{
        [key]:tag
      }
    })
  }

/*  handleInputType(value){
    this.props.dispatch({
      type:'editHost/handleInputVisibility',
      payload:{
        inputVisibility:!value
      }
    })
  }*/

  handleIdcChange(value,pre,all){
/*    const val = value.length > 0 ? [value.pop()] : []
    this.props.dispatch({
      type:'editHost/handleIdcChange',
      payload:{
        idc: val
      }
    })*/
    const val = typeof value === 'string' ? [value] : (value.length > 0 ? [value.pop()] : [])
    return val
  }

  handleCityChange(value,pre,all){
    //const val = value.length > 0 ? [value.pop()] : (typeof value === 'string' ? [value] : [])
    const val = typeof value === 'string' ? [value] : (value.length > 0 ? [value.pop()] : [])
/*this.props.dispatch({
      type:'editHost/handleCityChange',
      payload:{
        city: val
      }
    })*/
    return val;
  }

  changeIPText(){
    const ipText = this.props.edit.ipText
    this.props.dispatch({
      type:'editHost/handleIPShow',
      payload:{
        ipText: ipText === '显示 IP 属性...' ?
          '隐藏 IP 属性...' : '显示 IP 属性...',
        ipVisibility: ipText === '显示 IP 属性...' ? true : false
      }
    })
  }

  changeCertificateText(){
    const certificateText = this.props.edit.certificateText
    this.props.dispatch({
      type:'editHost/handleCertificateShow',
      payload:{
        certificateText: certificateText === '显示凭证属性...' ?
          '隐藏凭证属性...' : '显示凭证属性...',
        certificateVisibility: certificateText === '显示凭证属性...' ? true : false
      }
    })
  }

  changeAttributeText(){
    const attributeText = this.props.edit.attributeText
    this.props.dispatch({
      type:'editHost/handleAttributeShow',
      payload:{
        attributeText: attributeText === '显示可自动发现的属性...' ?
          '隐藏可自动发现的属性...' : '显示可自动发现的属性...',
        attributeVisibility: attributeText === '显示可自动发现的属性...' ? true : false
      }
    })
  }

  isIP(ip) {
    let re = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    return re.test(ip)
  }

  isPort = (port) =>{
    let re = /^([1-9]|[1-9]\d{1,3}|[1-6][0-5][0-5][0-3][0-5])$/
    return re.test(port)
  }

  checkIP(rule, value, callback) {
    if (!value) {
      callback()
    }else {
      if(this.isIP(value)){
        callback()
      }else{
        callback(`${value} 不是 IP 地址`);
      }
    }
  }

  checkPort(rule, value, callback) {
    if (!value) {
      callback()
    }else {
      if(this.isPort(value)){
        callback()
      }else{
        callback(`${value} 不是正确的端口格式`)
      }
    }
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

  render(){
    const { location, dispatch, edit, form } = this.props
    const { getFieldDecorator } = form
    const { ipText, ipVisibility, certificateText, certificateVisibility,
      attributeText, attributeVisibility, recommit } = edit

    const cityList = !edit.citys ? [] : edit.citys
    const idcList = !edit.idcs ? [] : edit.idcs
    const typeList = !edit.types ? [] : edit.types
    const connectTypeList = !edit.connectTypes ? [] : edit.connectTypes
    const tagList = edit.tag ? edit.tag.split(',') : []
    //const devops_nameList = edit.devops_names ? edit.devops_names : []
    const ipVisible = ipVisibility ? 'block': 'none'
    const certificateVisible = certificateVisibility ? 'block': 'none'
    const attributeVisible = attributeVisibility ? 'block': 'none'

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
            <FormItem label="主机名:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('name',{
                initialValue : edit.name,
                rules: [{
                  required: true,
                  message: '请输入主机名',
                }],
              })(
                <Input disabled={true} placeholder="主机名"/>
              )}
            </FormItem>
            <FormItem label="类型:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('type',{
                initialValue : HOST_TWO_TYPE[edit.type],
                rules: [{
                  required: true,
                  message: '请选择类型',
                }],
              })(
                <Select placeholder="请选择类型">
                  {typeList.map((data) => {
                    return (<Option key={new Date()} value={data+''}>{data}</Option>)
                  })}
                </Select>
              )}
            </FormItem>
            <FormItem label={idc_label}  {...formItemLayout} hasFeedback>
{/*              <Select key="1" mode="tags" value={edit.idc ? edit.idc : []}
                      onChange={this.handleIdcChange} placeholder="请选择数据中心">
                {idcList.map((data) => {
                  return (<Option key={new Date()} value={data+''}>{data}</Option>)
                })}
              </Select>*/}

              {getFieldDecorator('idc',{
                initialValue : edit.idc ? edit.idc : [],
                normalize:this.handleIdcChange,
                rules: [{
                  required: false,
                  message: '请选择数据中心',
                },{
                  pattern:/^[\u4e00-\u9fa5A-Za-z]{0,20}$/,
                  message:'数据中心名称必须是中文和字母，长度最大为20'
                }],
              })(
                <Select key="1"  mode="tags" placeholder="请选择数据中心">
                  {idcList.map((data) => {
                    return (<Option key={new Date()} value={data+''}>{data}</Option>)
                  })}
                </Select>
              )}
            </FormItem>
            <FormItem label={city_label}  {...formItemLayout} hasFeedback>
              {getFieldDecorator('city',{
                initialValue : edit.city ? edit.city : [],
                normalize:this.handleCityChange,
                rules: [{
                  required: false,
                  message: '请选择城市',
                },{
                  pattern:/^[\u4e00-\u9fa5A-Za-z]{0,20}$/,
                  message:'城市名称必须是中文和字母，长度最大为20'
                }],
              })(
                <Select key="2"  mode="tags" placeholder="请选择城市">
                  {cityList.map((data) => {
                    return (<Option key={data} value={data+''}>{data}</Option>)
                  })}
                </Select>
              )}
            </FormItem>
            <FormItem label="标签:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('tag',{
                initialValue : tagList,
                rules: [{
                  required: false,
                  message: '请选择标签',
                }],
              })(
                <Select mode="multiple" placeholder="请选择标签">
                  {window.DS.TAG.map((data) => {
                    return (<Option key={data} value={data+''}>{data}</Option>)
                  })}
                </Select>
              )}
            </FormItem>
            <FormItem label="连接方式:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('connect_type',{
                initialValue : edit.connect_type,
                rules: [{
                  required: false,
                  message: '请选择连接方式',
                }],
              })(
                <Select mode="multiple" placeholder="请选择连接方式">
                  {connectTypeList.map((data) => {
                    return (<Option key={new Date()} value={data+''}>{data}</Option>)
                  })}
                </Select>
              )}
            </FormItem>
{/*            <FormItem label="连接 IP:"  {...formItemLayout}>
              {getFieldDecorator('connect_ip',{
                initialValue : edit.connect_ip,
                rules: [{
                  required: true,
                  message: '请输入连接 IP',
                },
                {
                  validator: this.checkIP
                }],
              })(
                <Input disabled={true} placeholder="连接 IP"/>
              )}
            </FormItem>*/}
            <FormItem label="权重:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('weight',{
                initialValue : edit.weight,
                rules: [{
                  required: false,
                  message: '请输入权重',
                }],
              })(
                <InputNumber  type="number" min={0} max={100} style={{width:"100%"}} placeholder="权重"/>
              )}
            </FormItem>
            <FormItem label="优先级:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('priority',{
                initialValue : edit.priority,
                rules: [{
                  required: false,
                  message: '请输入优先级',
                }],
              })(
                <InputNumber  type="number" min={0} max={100} style={{width:"100%"}} placeholder="优先级"/>
              )}
            </FormItem>
            <Row style={{marginLeft:"16.666667%",marginBottom:"24px"}}>
              <a href="javascript:void(0);" style={{color:"#0FACF3"}}
                    onClick={this.changeIPText}>{ipText}</a>
            </Row>

            <Row className={ipVisible}>
            <FormItem label="业务 IP1:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('business_ip1',{
                initialValue : edit.business_ip1,
                onChange:this.handleInputChange.bind(this,'business_ip1'),
                rules: [{
                  required: false,
                  message: '请输入业务 IP1',
                },
                {
                  validator: this.checkIP
                }],
              })(
                <Input placeholder="业务 IP1"/>
              )}
            </FormItem>
            <FormItem label="业务 IP2:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('business_ip2',{
                initialValue : edit.business_ip2,
                onChange:this.handleInputChange.bind(this,'business_ip2'),
                rules: [{
                  required: false,
                  message: '请输入业务 IP2',
                },
                {
                  validator: this.checkIP
                }],
              })(
                <Input placeholder="业务 IP2"/>
              )}
            </FormItem>
            <FormItem label="业务 VIP1:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('business_vip1',{
                initialValue : edit.business_vip1,
                onChange:this.handleInputChange.bind(this,'business_vip1'),
                rules: [{
                  required: false,
                  message: '请输入业务 VIP1',
                },
                {
                  validator: this.checkIP
                }],
              })(
                <Input placeholder="业务 VIP1"/>
              )}
            </FormItem>
            <FormItem label="业务 VIP2:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('business_vip2',{
                initialValue : edit.business_vip2,
                onChange:this.handleInputChange.bind(this,'business_vip2'),
                rules: [{
                  required: false,
                  message: '请输入业务 VIP2',
                },
                {
                  validator: this.checkIP
                }],
              })(
                <Input placeholder="业务 VIP2"/>
              )}
            </FormItem>
            <FormItem label="管理 IP:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('admin_ip1',{
                initialValue : edit.admin_ip1,
                onChange:this.handleInputChange.bind(this,'admin_ip1'),
                rules: [{
                  required: false,
                  message: '请输入管理 IP',
                },
                {
                  validator: this.checkIP
                }],
              })(
                <Input placeholder="管理 IP"/>
              )}
            </FormItem>
            <FormItem label="管理 VIP:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('admin_vip1',{
                initialValue : edit.admin_vip1,
                onChange:this.handleInputChange.bind(this,'admin_vip1'),
                rules: [{
                  required: false,
                  message: '请输入管理 VIP',
                },
                {
                  validator: this.checkIP
                }],
              })(
                <Input placeholder="管理 VIP"/>
              )}
            </FormItem>
            <FormItem label="连接 IP:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('connect_ip',{
                initialValue : edit.connect_ip,
                onChange:this.handleInputChange.bind(this,'connect_ip'),
                rules: [{
                  required: false,
                  message: '请输入连接 IP',
                },
                {
                  validator: this.checkIP
                }],
              })(
                <Input placeholder="连接 IP"/>
              )}
            </FormItem>
            </Row>
            <Row style={{marginLeft:"16.666667%",marginBottom:"24px"}}>
              <a href="javascript:void(0);" style={{color:"#0FACF3"}}
                    onClick={this.changeCertificateText}>{certificateText}</a>
            </Row>
            <Row className={certificateVisible}>
            <FormItem label="高权用户:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('root_name',{
                initialValue : edit.root_name,
                onChange:this.handleInputChange.bind(this,'root_name'),
                rules: [{
                  required: false,
                  message: '请输入高权用户',
                }],
              })(
                <Input placeholder="高权用户"/>
              )}
            </FormItem>
            <FormItem label="高权用户密码:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('root_password',{
                //initialValue : edit.root_password,
                onChange:this.handleInputChange.bind(this,'root_password'),
                rules: [{
                  required: false,
                  message: '请输入高权用户密码',
                },
                {
                  validator: this.checkPass
                }],
              })(
                <Input placeholder="高权用户密码" type="password"/>
              )}
            </FormItem>
            <FormItem label="普通用户:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('user_name',{
                initialValue : edit.user_name,
                onChange:this.handleInputChange.bind(this,'user_name'),
                rules: [{
                  required: false,
                  message: '请输入普通用户',
                }],
              })(
                <Input placeholder="普通用户"/>
              )}
            </FormItem>
            <FormItem label="普通用户密码:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('user_password',{
                //initialValue : edit.user_password,
                onChange:this.handleInputChange.bind(this,'user_password'),
                rules: [{
                  required: false,
                  message: '请输入普通用户密码',
                },
                {
                  validator: this.checkPass
                }],
              })(
                <Input placeholder="普通用户密码" type="password"/>
              )}
            </FormItem>
            <FormItem label="SSH 端口:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('connect_port',{
                initialValue : edit.connect_port,
                onChange:this.handleInputChange.bind(this,'connect_port'),
                rules: [{
                  required: false,
                  message: '请输入SSH 端口',
                },
                {
                  validator: this.checkPort
                }],
              })(
                <Input placeholder="SSH 端口"/>
              )}
            </FormItem>
            <FormItem label="私钥:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('remember_token',{
                //initialValue : edit.remember_token,
                onChange:this.handleInputChange.bind(this,'remember_token'),
                rules: [{
                  required: false,
                  message: '请输入私钥',
                },
                {
                  validator: this.checkPass
                }],
              })(
                <Input type="password" placeholder="私钥" />
              )}
            </FormItem>
            </Row>
            <Row style={{marginLeft:"16.666667%",marginBottom:"24px"}}>
              <a href="javascript:void(0);" style={{color:"#0FACF3"}}
                    onClick={this.changeAttributeText}>{attributeText}</a>
            </Row>
            <Row className={attributeVisible}>
              <FormItem label="系统结构:"  {...formItemLayout} hasFeedback>
                {getFieldDecorator('os_arch',{
                  initialValue : edit.os_arch,
                  onChange:this.handleInputChange.bind(this,'os_arch'),
                  rules: [{
                    required: false,
                    message: '请输入系统结构',
                  }],
                })(
                  <Input placeholder="系统结构"/>
                )}
              </FormItem>
              <FormItem label="系统内核:"  {...formItemLayout} hasFeedback>
                {getFieldDecorator('os_kernel',{
                  initialValue : edit.os_kernel,
                  onChange:this.handleInputChange.bind(this,'os_kernel'),
                  rules: [{
                    required: false,
                    message: '请输入系统内核',
                  }],
                })(
                  <Input placeholder="系统内核"/>
                )}
              </FormItem>
              <FormItem label="系统版本:"  {...formItemLayout} hasFeedback>
                {getFieldDecorator('os_version',{
                  initialValue : edit.os_version,
                  onChange:this.handleInputChange.bind(this,'os_version'),
                  rules: [{
                    required: false,
                    message: '请输入系统版本',
                  }],
                })(
                  <Input placeholder="系统版本"/>
                )}
              </FormItem>
              <FormItem label="挂载分区:"  {...formItemLayout} hasFeedback>
                {getFieldDecorator('mounts',{
                  initialValue : edit.mounts,
                  onChange:this.handleInputChange.bind(this,'mounts'),
                  rules: [{
                    required: false,
                    message: '请输入挂载分区',
                  }],
                })(
                  <Input placeholder="挂载分区"/>
                )}
              </FormItem>
              <FormItem label="处理器:"  {...formItemLayout} hasFeedback>
                {getFieldDecorator('processor',{
                  initialValue : edit.processor,
                  onChange:this.handleInputChange.bind(this,'processor'),
                  rules: [{
                    required: false,
                    message: '请输入处理器',
                  }],
                })(
                  <Input placeholder="处理器"/>
                )}
              </FormItem>
              <FormItem label="网卡:"  {...formItemLayout} hasFeedback>
                {getFieldDecorator('interfaces',{
                  initialValue : edit.interfaces,
                  onChange:this.handleInputChange.bind(this,'interfaces'),
                  rules: [{
                    required: false,
                    message: '请输入网卡',
                  }],
                })(
                  <Input placeholder="网卡"/>
                )}
              </FormItem>
              <FormItem className="formicon-right">
                <IconFont type="bulb" className="text-warning"/>
                <span>以上属性可自动发现，不建议手工录入</span>
              </FormItem>
            </Row>
            <FormItem className="mart-24">
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
    edit: state['editHost'],
    loading: state.loading.effects,
  }
})(Form.create()(Edit))
