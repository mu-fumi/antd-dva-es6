/**
 * Created by zhangmm on 2017/8/18.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './edit.less'
import { DataTable, Filter } from 'components'
import { Link } from 'dva/router'
import { Row , Form, Input, Button } from 'antd'

const FormItem = Form.Item
const { TextArea } = Input

class Edit extends Base{
  constructor(props){
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    //设置返回按钮
    this.setGobackBtn()
    //返回时清空输入域里的值
    this.push({
      type:"editClient/handleReset"
    })
  }

  handleSubmit = (e) =>{
    e.preventDefault()
    //获取路由的id
    const id = this.props.params.id
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      this.props.dispatch({
        type:"editClient/editClient",
        payload:values,
        id: id
      })
    })
  }


  render(){
    const { location, dispatch, edit, form } = this.props
    const { getFieldDecorator } = form
    const { name, desc } = edit

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
            <FormItem label="客户名称:"  {...formItemLayout}>
              {getFieldDecorator('name', {
                initialValue : name,
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
                initialValue : desc,
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

Edit.propTypes = {
  edit: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    edit: state['editClient'],
    loading: state.loading.effects,
  }
})(Form.create()(Edit))
