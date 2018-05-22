/**
 * Created by zhangmm on 2017/9/28.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './add.less'
import { DataTable, Filter, IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Form, Input, Button, Select } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const { TextArea } = Input

class Add extends Base{
  constructor(props){
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    //设置返回按钮
    this.setGobackBtn()
  }

  handleSubmit = (e) =>{
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      this.props.dispatch({
        type:"addInstance/addInstance",
        payload:values
      })
    })
  }

  render(){
    const { location, dispatch, add, form } = this.props
    const { getFieldDecorator } = form

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
            <FormItem label="实例名称:"  {...formItemLayout}>
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  message: '请输入实例名称',
                }],
              })(
                <Input placeholder="实例名称"/>
              )}
            </FormItem>
            <FormItem label="套件名称:"  {...formItemLayout}>
              {getFieldDecorator('stack_id', {
                rules: [{
                  required: true,
                  message: '请选择套件名称',
                }],
              })(
                <Input placeholder="套件名称"/>
              )}
            </FormItem>
            <FormItem label="描述:"  {...formItemLayout}>
              {getFieldDecorator('desc',{
                rules: [{
                  required: false,
                  message: '请输入描述',
                }],
              })(
                <TextArea placeholder="描述" autosize={{ minRows: 2, maxRows: 6 }} />
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

Add.propTypes = {
  add: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    add: state['addInstance'],
    loading: state.loading.effects,
  }
})(Form.create()(Add))
