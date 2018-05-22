/**
 * Created by zhangmm on 2017/9/1.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './add.less'
import { DataTable, Filter, IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Form, Input, Button, Select, Icon } from 'antd'
import { constant } from 'utils'
const {NAME_COMPLEXITY} = constant
const { TextArea } = Input
const FormItem = Form.Item
const Option = Select.Option

class Add extends Base{
  constructor(props){
    super(props)

    //设置返回按钮
    this.setGobackBtn()
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '应用新增', selectedKey: '应用管理application'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.handleSubmit = this.handleSubmit.bind(this)
    this.checkName = this.checkName.bind(this)
    /*this.push({type:"selfDef",fire: [Base.DidMount]})*/
  }

  componentWillMount(){
/*    this.props.dispatch({
      type:"addApp/getUsers"
    })*/
    this.props.dispatch({
      type:"addApp/getBusinesses",
      payload:{
        type:0,
        paging:0//获取全部，否则是分页
      }
    })
  }

/*  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields()
  }*/

  handleSubmit = (e) =>{
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      this.props.dispatch({type:'addApp/handleRecommit',payload:{recommit:true}})
      this.props.dispatch({
        type:"addApp/addApp",
        payload:values
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
    const { location, dispatch, add, form } = this.props
    const { getFieldDecorator } = form
    const { businesses, recommit } = add

    //const nameError = isFieldTouched('name') && getFieldError('name')
    const display = businesses.length === 0 ? 'show' : 'hide'

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

    /*const hasErrors = (fieldsError) => {
      console.log("fieldsError==========>", fieldsError)
      return Object.keys(fieldsError).some(field => fieldsError[field])
    }*/

    return(
      <Row className={styles.add}>
        <Row className="inner-cont">
          <Form onSubmit={this.handleSubmit}>
            <FormItem label="应用名称:" {...formItemLayout} hasFeedback>
              {getFieldDecorator('name', {
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
              <Row className={display}>
                <Icon type="exclamation-circle" className="text-warning pad-15"/>
                <span>该应用没有所属业务，请先<Link to='/cmdb/business/add'>新增业务</Link></span>
              </Row>
            </FormItem>
            <FormItem label="备注:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('desc',{
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

Add.propTypes = {
  add: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    add: state['addApp'],
    loading: state.loading.effects,
  }
})(Form.create()(Add))
