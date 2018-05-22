/**
 * Created by zhangmm on 2017/8/18.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './add.less'
import { DataTable, Filter } from 'components'
import { Link } from 'dva/router'
import { Row , Form, Input, Button } from 'antd'

const FormItem = Form.Item
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
        type:"addClient/addClient",
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
              <FormItem label="客户名称:"  {...formItemLayout}>
                {getFieldDecorator('name', {
                  rules: [{
                    required: true,
                    message: '请输入客户名称',
                  }],
                })(
                  <Input placeholder="客户名称"/>
                )}
              </FormItem>
              <FormItem label="说明:"  {...formItemLayout}>
                {getFieldDecorator('desc',{
                  rules: [{
                    required: false,
                    message: '请输入说明',
                  }],
                })(
                  <TextArea placeholder="说明" autosize={{ minRows: 2, maxRows: 6 }} />
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
    add: state['addClient'],
    loading: state.loading.effects,
  }
})(Form.create()(Add))
