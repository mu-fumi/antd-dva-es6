/**
 * Created by wengyian on 2017/7/24.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, message, Button, Modal, Steps, Form, Tabs, Tooltip } from 'antd'
import { DataTable, Search, Filter, IconFont } from 'components'
import { classnames } from 'utils'
import _ from 'lodash'
import styles from './stack.less'

const FormItem = Form.Item

let uuid = 0

class EditDeploymentModal extends React.Component{
  constructor(props){
    super(props)

    let configObj = {}
    if(!_.isEmpty(props.stackConfig)){
      Object.keys(props.stackConfig).forEach((item, key) => {
        uuid++
        configObj[uuid] = {}
        configObj[uuid].key = item
        configObj[uuid].value = props.stackConfig[item]
      })
    }

    this.state = {
      visible : props.visible,
      stackConfig : props.stackConfig,
      serviceId : props.serviceId,
      configObj : configObj
    }

    this.onOk = this.onOk.bind(this)
    this.onCancel = this.onCancel.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if(this.state.visible !== nextProps.visible ||
      !_.isEqual(this.state.stackConfig, nextProps.stackConfig) ||
      this.state.serviceId !== nextProps.serviceId
    ){
      let configObj = {}
      if(!_.isEmpty(nextProps.stackConfig)){
        Object.keys(nextProps.stackConfig).forEach((item, key) => {
          uuid++
          configObj[uuid] = {}
          configObj[uuid].key = item
          configObj[uuid].value = nextProps.stackConfig[item]
        })
      }
      // console.log('configObj===>', configObj)

      this.setState({
        visible : nextProps.visible,
        stackConfig : nextProps.stackConfig,
        serviceId : nextProps.serviceId,
        configObj : configObj
      })
    }
  }

  // componentDidMount(){
  //   this.props.form.resetFields()
  // }
  //
  // componentWillUnmount(){
  //   this.props.form.resetFields()
  // }

  add(){
    uuid++
    let configObj = this.state.configObj
    // console.log('configObj===>', configObj)
    // console.log('uuid===>', uuid)
    configObj[uuid] = {}
    this.setState({
      configObj :configObj
    })
  }

  remove(key){
    let configObj = this.state.configObj
    delete configObj[key]
    this.setState({
      configObj : configObj
    })
  }

  onOk(){
    // console.log('this.state.configObj===>', this.state.configObj)
    this.props.form.validateFields((err, values) => {
      let isSubmit = true
      let errTip = []
      if(err){
        isSubmit = false
        errTip.push('配置信息不全')
      }
      // console.log('values===>', values)
      let conf = {}
      Object.keys(values).forEach((item, key) => {
        let type =  item.split('-_-')[0]
        let id = item.split('-_-')[1]
        if(type === 'key') {
          let val = 'val-_-' + id
          if (values[item].trim() in conf) {
            errTip.includes(`配置项 ${values[item].trim()} 重复`) || errTip.push(`配置项 ${values[item].trim()} 重复`)
            isSubmit = false
          } else {
            if(values[item] && values[item].trim()){
              conf[values[item].trim()] = values[val].trim()
            }
          }
        }
      })
      if(!isSubmit){
        const errContent = errTip.map(val => {
          return <Row>{val}</Row>
        })
        Modal.error({
          title : '错误信息提示：',
          content : errContent
        })
        return false
      }
      if(this.props.onOk){
        this.props.onOk(conf)
      }
      // this.props.form.resetFields()
    })
  }

  onCancel(){
    Modal.confirm({
      title : '提示',
      content : '确定不保存修改信息吗？',
      onOk : () => {
        if(this.props.onCancel){
          this.props.onCancel()
        }
      },
    })
  }

  render(){

    const { getFieldDecorator } = this.props.form

    // console.log('this.state.configObj in render===>', this.state.configObj)

    return (
      <Modal
        visible={this.state.visible}
        key={this.state.serviceId}
        title="编辑配置信息"
        onOk={this.onOk}
        okText="保存"
        onCancel={this.onCancel}
        afterClose={this.props.afterClose}
      >
        <Form>
          {
            Object.keys(this.state.configObj).map((item) => {
              return (
                <Row key={item}>
                  <Col span="6">
                    <FormItem>
                      { getFieldDecorator(`key-_-${item}`, {
                        initialValue: this.state.configObj[item].key,
                        rules : [{
                          required : true,
                          message : '请指定该配置信息',
                          whitespace : true
                        }]
                      })(
                        <Input placeholder="配置项"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span="8" offset="1">
                    <FormItem>
                      { getFieldDecorator(`val-_-${item}`, {
                        initialValue: this.state.configObj[item].value,
                        rules : [{
                          required : true,
                          message : '请指定该配置信息',
                          whitespace : true
                        }]
                      })(
                        <Input placeholder="配置内容"/>
                      )}
                    </FormItem>
                  </Col>
                  <Col>
                    <Tooltip title="点击删除配置信息">
                      <IconFont
                        type="minus-circle-o"
                        className={styles['delete-conf']}
                        onClick={this.remove.bind(this, item)}
                      />
                    </Tooltip>
                  </Col>
                </Row>
              )
            })
          }
        </Form>
        <Row>
          <a href="javascript:;" onClick={this.add.bind(this)}>
            添加配置信息
          </a>
        </Row>
      </Modal>
    )
  }
}

export default Form.create()(EditDeploymentModal)
