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
import { Row , Form, Input, Button, Select } from 'antd'
const { TextArea } = Input
import { constant } from 'utils'
const {NAME_COMPLEXITY} = constant

const FormItem = Form.Item
const Option = Select.Option

class Add extends Base{
  constructor(props){
    super(props)

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '业务新增', selectedKey: '业务管理business'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    //设置返回按钮
    this.setGobackBtn()
//:: 函数绑定运算符  obj::func  ===  func.bind(obj)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.checkName = this.checkName.bind(this)
  }

  componentWillMount(){
    this.props.dispatch({
      type:"addBusiness/getUsers"
    })
  }

  handleSubmit = (e) =>{
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      //写死client_id
      const data = {
        ...values,
        client_id:'2'
      }
      this.props.dispatch({type:'addBusiness/handleRecommit',payload:{recommit:true}})
      this.props.dispatch({
        type:"addBusiness/addBusiness",
        payload:data
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
    const { users, recommit } = add

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
            <FormItem label="业务名称:"  {...formItemLayout} hasFeedback>
              {getFieldDecorator('name', {
                //validateTrigger : 'onBlur',
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
                rules: [{
                  required: true,
                  message: '请选择负责人',
                }],
              })(
                <Select placeholder="请选择负责人">
                  {
                    users.map((data) => {
                      return (<Option key={data.id} value={data.id+''}>{data.user_name}</Option>)
                    })
                  }
                </Select>
              )}
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
              <Button type="primary" htmlType="submit" className="margin-but" loading={recommit}>保存</Button>
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
    add: state['addBusiness'],
    loading: state.loading.effects,
  }
})(Form.create()(Add))
