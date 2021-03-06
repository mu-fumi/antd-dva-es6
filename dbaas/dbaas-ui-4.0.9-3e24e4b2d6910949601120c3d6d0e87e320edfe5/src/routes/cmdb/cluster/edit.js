/**
 * Created by zhangmm on 2017/9/2.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './edit.less'
import { DataTable, Filter, IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Form, Input, Button, Select } from 'antd'

const FormItem = Form.Item
const Option = Select.Option
const { TextArea } = Input

class Edit extends Base{
  constructor(props){
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    //设置返回按钮
    this.setGobackBtn()
    //返回时清空输入域里的值
    this.push({
      type:"editCluster/handleReset"
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
        type:"editCluster/editCluster",
        payload:values,
        id: id
      })
    })
  }


  render(){
    const { location, dispatch, edit, form } = this.props
    const { getFieldDecorator } = form
    const { name, desc, user_id, users, app_id, apps } = edit

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
            <FormItem label="集群名称:"  {...formItemLayout}>
              {getFieldDecorator('name', {
                initialValue : name,
                rules: [{
                  required: true,
                  message: '请输入集群名称',
                }],
              })(
                <Input placeholder="集群名称"/>
              )}
            </FormItem>
            <FormItem label="用户:"  {...formItemLayout}>
              {getFieldDecorator('user_id',{
                initialValue : user_id + '',
                rules: [{
                  required: false,
                  message: '请选择用户',
                }],
              })(
                <Select size="large" placeholder="请选择用户">
                  {
                    users.map((data) => {
                      return (<Option key={data.id} value={data.id+''}>{data.user_name}</Option>)
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem label="应用:"  {...formItemLayout}>
              {getFieldDecorator('app_id',{
                initialValue : app_id + '',
                rules: [{
                  required: true,
                  message: '请选择应用',
                }],
              })(
                <Select size="large" placeholder="请选择应用">
                  {
                    apps.map((data) => {
                      return (<Option key={data.id} value={data.id+''}>{data.name}</Option>)
                    })
                  }
                </Select>
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
    edit: state['editCluster'],
    loading: state.loading.effects,
  }
})(Form.create()(Edit))
