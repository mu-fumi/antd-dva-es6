/**
 * Created by wengyian on 2017/9/8.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Input, message, Form, Button, Modal, Card} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames} from 'utils'
import _ from 'lodash'
import {constant, TimeFilter} from 'utils'

const FormItem = Form.Item
class PwdModal extends React.Component{
  constructor(props){
    super(props)

    this.onOk = this.onOk.bind(this)
    this.onCancel = this.onCancel.bind(this)
  }

  componentWillReceiveProps(nextProps){

  }

  onOk(){
    this.props.form.validateFields((err, values) => {
      if(err){
        return false
      }
      if(this.props.onOk){
        this.props.onOk(values.pwd)
      }
    })
  }

  onCancel(){
    if(this.props.onCancel){
      this.props.onCancel()
    }
  }

  render(){

    const { visible, form } = this.props
    const { getFieldDecorator } = form
    const formlayout= {
      labelCol : {
        span : 6
      },
      wrapperCol : {
        span : 18
      }
    }

    return (
      <Modal
        title="请输入当前账户登录密码"
        visible={visible}
        onOk={this.onOk}
        onCancel={this.onCancel}
      >
        <Form>
          <FormItem label="账户登录密码" {...formlayout}>
            {getFieldDecorator('pwd', {
              rules : [{
                required : true,
                message : '请填写密码'
              }]
            })(
              <Input type="password" placeholder="请输入当前账户登录密码"/>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

PwdModal.propTypes = {
  visible : PropTypes.bool,
  onOk : PropTypes.func,
  onCancel: PropTypes.func,
}

export default Form.create()(PwdModal)
