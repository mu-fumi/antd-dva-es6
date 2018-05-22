/**
 * Created by zhangmm on 2017/9/2.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './add.less'
import { DataTable, Filter, IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Form, Input, Button, Select } from 'antd'

const Option = Select.Option
const FormItem = Form.Item
const { TextArea } = Input

class Add extends Base{
  constructor(props){
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    //设置返回按钮
    this.setGobackBtn()
  }

  componentWillMount(){
/*    this.props.dispatch({
      type:"addCluster/getUsers"
    })*/
    this.props.dispatch({
      type:"addCluster/getApplications"
    })
  }

  handleSubmit = (e) =>{
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      this.props.dispatch({
        type:"addCluster/addCluster",
        payload:values
      })
    })
  }

  render(){
    const { location, dispatch, add, form } = this.props
    const { getFieldDecorator } = form
    const { users, apps } = add

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
            <FormItem label="集群名称:"  {...formItemLayout}>
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                  message: '请输入集群名称',
                }],
              })(
                <Input placeholder="集群名称"/>
              )}
            </FormItem>
{/*            <FormItem label="用户:"  {...formItemLayout}>
              {getFieldDecorator('user_id',{
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
            </FormItem>*/}
            <FormItem label="应用:"  {...formItemLayout}>
              {getFieldDecorator('app_id',{
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
    add: state['addCluster'],
    loading: state.loading.effects,
  }
})(Form.create()(Add))
