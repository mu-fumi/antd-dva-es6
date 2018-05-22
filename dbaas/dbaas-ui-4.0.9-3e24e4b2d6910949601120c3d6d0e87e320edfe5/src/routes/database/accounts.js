/**
 * Created by zhangmm on 2017/10/31.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './accounts.less'
import { DataTable, Filter, IconFont } from 'components'
import { Row , Col, Form, Input, Button, Select, Icon, message, Table } from 'antd'
import { accountExists } from 'services/database'
import PrivilegeModal from './privilegeModal.js'

const FormItem = Form.Item
const Option = Select.Option
const { TextArea } = Input
class Accounts extends Base{
  constructor(props){
    super(props)

    //设置返回按钮
    this.setGobackBtn()

    this.state = {
      privilegeTitle:'权限列表',
      privilegeVisible:false
    }

    this.exists = this.exists.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handlePrivilegeShow = this.handlePrivilegeShow.bind(this)
    this.handlePrivilegeOk = this.handlePrivilegeOk.bind(this)
    this.handlePrivilegeCancel = this.handlePrivilegeCancel.bind(this)
  }

  componentWillMount(){

  }

  exists(rule, value, callback) {
    if (!value) {
      callback()
    }else {
      const id = 17185
      accountExists(id, value)
        .then((res) => {
          if(res.code === 0){
            if(res.data.exists){
              callback('抱歉，该数据库账户已被占用。')
            }else{
              callback()
            }
          }else{
            message.error( res.msg || res.error )
          }
        })
        .catch((err) => {
          message.error(err)
          callback(err)
        })
    }
  }

  handleSubmit = (e) =>{
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }

    })
  }

  handlePrivilegeShow (text){
    this.setState({
      privilegeVisible:true
    })
  }

  handlePrivilegeOk (){
    this.setState({
      privilegeVisible:false
    })
  }

  handlePrivilegeCancel (){
    this.setState({
      privilegeVisible:false
    })
  }

  render(){
    const { location, dispatch, accounts, form } = this.props
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched  } = form
    //const {  } = accounts

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

    const dbCols = [{
      title: '数据库',
      dataIndex: 'db_name',
      render: (text) => {
        return (
          <span>
              <span>{text}</span>
              <a className='pull-right' href='javascript:void(0)'
                 onClick={() =>this.handlePrivilegeShow(this,text)}>权限</a>
          </span>
        )
      }
    }]

    //todo 需要拿到数据组装重写，暂时mock
    const dbs = [{
      'db_name':'*',
      'key':0
    }]

    const dbSelection = {
      getCheckboxProps: function (record) {
        return {
          defaultChecked: true,
          disabled: false
        }
      },
     /* selectedRowKeys: selected,
      onSelect: this.dbSelect,
      onSelectAll: this.dbSelectAll*/
    }

    let pvlgSelection = {
      getCheckboxProps: (record) => {
        let coded = true
        return {
          defaultChecked: coded,
          disabled: false
        };
      },
/*      selectedRowKeys: curSelected,
      onSelect: this.handleSelect,
      onSelectAll: this.handleSelectAll*/
    };

    const grantCols = [{
      title: '数据库',
      dataIndex: 'db_name',
/*      render: (text) => {
        return (<div className='db-min'>{text}</div>)
      }*/
    }, {
      title: '权限',
      dataIndex: 'privilege',
/*      render: (arr) => {
        if(arr.length == 0 || !arr ){
          return ( <div className='wrap-break'>
            <span><Icon type='info-circle' className='warn mgr-10'/>请设置权限</span>
          </div>)
        }else if(Object.prototype.toString.call(arr) === '[object String]' ){
          return (<div className='wrap-break'>{arr}</div>)
        }
        let text = arr.map((t,i)=>{
          if (arr.length == (i + 1)) {
            if (this.props.global.indexOf(t) == -1) {
              return (<span key={i}>{t}</span>)
            } else {
              return <span key={i}> <i className="font-10 iconfont ">&#xe613;</i>{t}</span>
            }
          } else {
            if (this.props.global.indexOf(t) == -1) {
              return (<span key={i}>{t},</span>)
            } else {
              return <span key={i}> <i className="font-10 iconfont ">&#xe613;</i>{t},</span>
            }
          }

        })
        return (<div className='wrap-break'>{text}</div>)
      }*/
    }]

    //todo 需要拿到数据组装重写，暂时mock
    const dataSource = [
      {key:0,privilege:"SELECT"},
      {key:1,privilege:"INSERT"},
      {key:2,privilege:"DELETE"},
      {key:3,privilege:"UPDATE"},
      {key:4,privilege:"DROP"},
      {key:5,privilege:"ALTER"},
      {key:6,privilege:"ALTER ROUTINE"},
      {key:7,privilege:"CREATE"},
      {key:8,privilege:"CREATE ROUTINE"},
      {key:9,privilege:"CREATE TABLESPACE"},
      {key:10,privilege:"CREATE TEMPORARY TABLES"},
      {key:11,privilege:"CREATE USER"},
      {key:12,privilege:"CREATE VIEW"},
      {key:13,privilege:"EVENT"},
      {key:14,privilege:"EXECUTE"},
      {key:15,privilege:"FILE"},
    ]

    const privililegeModalProps = {
      title:this.state.privilegeTitle,
      visible:this.state.privilegeVisible,
      onOk:this.handlePrivilegeOk,
      onCancel:this.handlePrivilegeCancel,
      dataSource:dataSource,
      pvlgSelection:pvlgSelection
    }

    return(
      <Row className={styles.add}>
        <Row className="inner-cont">
          <Form onSubmit={this.handleSubmit}>
            <FormItem label="数据库账号:" {...formItemLayout}>
              {getFieldDecorator('account_name', {
                rules: [{
                  required: true,
                  message: '请填写数据库账号'
                },
                  {
                    validator: this.exists
                  }],
              })(
                <Input placeholder="数据库账号"/>
              )}
            </FormItem>
            <FormItem label="授权:"  {...formItemLayout}>
              <Row className='table-scroll'>
                <Table bordered={true} columns={dbCols} rowSelection={dbSelection}
                       pagination={false} dataSource={dbs}/>
                <Col span='24' className='mgt-10 '>
                  <a href="javascript:void(0);" >创建新数据库</a>
                </Col>
              </Row>
              <Row >
                <Table bordered={true} columns={grantCols}
                       pagination={false}/>
              </Row>
            </FormItem>
            <FormItem label="密码:"  {...formItemLayout}>
              {getFieldDecorator('account_password',{
                rules: [{
                  required: true,
                  message: '请输入密码',
                }],
              })(
                <Input placeholder="密码" type='password'/>
              )}
            </FormItem>
            <FormItem label="确认密码:"  {...formItemLayout}>
              {getFieldDecorator('account_password_confirmation',{
                rules: [{
                  required: true,
                  message: '请输入确认密码',
                }],
              })(
                <Input placeholder="确认密码" type='password'/>
              )}
            </FormItem>
            <FormItem label="备注说明:"  {...formItemLayout}>
              {getFieldDecorator('remark',{
                rules: [{
                  required: false,
                  message: '请输入备注说明',
                }],
              })(
                <TextArea placeholder="备注说明" autosize={{ minRows: 2, maxRows: 6 }} />
              )}
            </FormItem>
            <FormItem>
              <Button type="primary" htmlType="submit" className="margin-but" >确定</Button>
            </FormItem>
          </Form>
        </Row>
        <PrivilegeModal {...privililegeModalProps}/>
      </Row>
    )
  }
}

Accounts.propTypes = {
  accounts: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    accounts: state['accounts'],
    loading: state.loading.effects,
  }
})(Form.create()(Accounts))
