/**
 * Created by zhangmm on 2017/10/31.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './add.less'
import { DataTable, Filter, IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Form, Input, Button, Select, Icon, message } from 'antd'
import { dbExists } from 'services/database'
const { TextArea } = Input
const FormItem = Form.Item
const Option = Select.Option

class Add extends Base{
  constructor(props){
    super(props)

    this.exists = this.exists.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

    //设置返回按钮
    this.setGobackBtn()
  }

  componentWillMount(){
    this.props.dispatch({
      type:"addDb/getCharset",
      payload:{
        id:17185
      }
    })
    this.props.dispatch({
      type:"addDb/getAccounts",
      payload:{
        id:17185
      }
    })
  }

  exists(rule, value, callback) {
    if (!value) {
      callback()
    }else {
      const id = 17185
      dbExists(id, value)
        .then((res) => {
          if(res.code === 0){
            if(res.data.exists){
              callback('抱歉，该数据库名称已被占用。')
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
      this.props.dispatch({
        type:"addDb/addDatabase",
        payload:{
          id:17185,
          data:values
        }
      })
    })
  }

  render(){
    const { location, dispatch, add, form } = this.props
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched  } = form
    const { charsets, accounts } = add

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
            <FormItem label="数据库名称:" {...formItemLayout}>
              {getFieldDecorator('db_name', {
                rules: [{
                  required: true,
                  message: '请填写数据库名称'
                },
                {
                  max:20,
                  message: '数据库名称的最大长度为20',
                },{
                    pattern: /^[^\s]+$/,
                    message: '数据库名称不能输入空格'
                  },
                {
                  validator: this.exists
                }],
              })(
                <Input placeholder="数据库名称"/>
              )}
            </FormItem>
            <FormItem label="字符集:"  {...formItemLayout}>
              {getFieldDecorator('charset',{
                rules: [{
                  required: true,
                  message: '请选择字符集',
                }],
              })(
                <Select placeholder="请选择字符集">
                  {
                    charsets.map((data,key) => {
                      return (<Option key={key} value={data}>{data}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label="绑定账号:"  {...formItemLayout}>
              {getFieldDecorator('accounts',{
                rules: [{
                  required: false,
                  message: '请选择绑定账号',
                }],
              })(
                <Row>
                  <Select placeholder="请选择绑定账号" disabled={accounts.length === 0}>
                    {
                      accounts.map((data,key) => {
                        return (<Option key={key} value={data}>{data}</Option>)
                      })
                    }
                  </Select>
                  <Icon type="exclamation-circle" className="text-warning"/>
                  {/*<span className="pad-15">账号列表为空,<Link to="accounts/17185/add">创建新账号</Link></span>*/}
                  <span className="pad-15">账号列表为空,<a href="javascript:void(0);"
                                                     className="text-info">创建新账号</a></span>
                </Row>
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
    add: state['addDb'],
    loading: state.loading.effects,
  }
})(Form.create()(Add))
