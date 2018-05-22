/**
 * Created by wengyian on 2018/3/27.
 */

import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Input, message, Form, Radio, Modal, Select, Tag} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon} from 'components'
import {routerRedux, Link, browserHistory,} from 'dva/router'
import {classnames, constant, Logger} from 'utils'
import _ from 'lodash'
import styles from './modal.less'
import RelateSelect from './relateSelect'
import {getService} from 'services/nodes'
const Option = Select.Option
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const formLayout = {
  labelCol: {
    span: 3
  },
  wrapperCol: {
    span: 12
  }
}
class ReportModal extends React.Component{
  constructor(props) {
    super(props)
    this.handleRadioChange = this.handleRadioChange.bind(this)
    this.makeSure = this.makeSure.bind(this)
    this.handleOk = this.handleOk.bind(this)
    this.changeRelate = this.changeRelate.bind(this)
    this.changeRelateType = this.changeRelateType.bind(this)
    this.changeRelateId = this.changeRelateId.bind(this)
    let {serviceList = [], selectedBaseInfo = {}} = props
    let defaultService = []
    Logger.info('props===>', props)
    for (let i = 0; i < serviceList.length; i++) {
      if (serviceList[i].service.toLowerCase().includes('zabbix-agent')) {
        const value = serviceList[i].id
        defaultService = defaultService.concat(value)
        break
      }
    }
    defaultService = selectedBaseInfo.service.length ? selectedBaseInfo.service : defaultService
    this.state = {
      selectedNodes: [],
      businessVal:[], //保存ID值
      appVal: [],
      relateid: [],
      report_type: 'deep',
      isLoading:false,
      selService: defaultService, // 20180409 已选的服务 用于几个服务之间相互关联
    }
  }

  changeRelateId(value) {
    this.setState({
      isLoading: true
    })
    const relateId = value.id
    if (!relateId) {
      return
    }
    const id = relateId.split('-_-')[1]
    /****** 20180224 新增获取所属类型******/
    const relateType = value.type

    this.setState({
      relateid:id
    })
    this.props.getRelate(id,relateType)
  }
  changeRelateType(value) {
    const {form} = this.props
    const app = form.getFieldValue('app_id')
    if (!app) {
      return
    }
    if (this.props.clearRelate) {
      this.props.clearRelate()
    }
    const app_id = app.split('-_-')[1]
    const relateType = value.type
    form.setFieldsValue({
      relate: {
        id: '',
        type: relateType
      }
    })
    if (this.props.getRelateList) {
      this.props.getRelateList({
        type: relateType,
        data: {
          app_id: app_id
        }
      })
    }
  }
  changeRelate(value) {
    // 清空已选服务
   /* if (this.props.clearService) {
      this.props.clearService()
    }*/

    if (value.change === 'type') {
      this.changeRelateType(value)
    } else if (value.change === 'id') {
      this.changeRelateId(value)
    }
  }
  makeSure() {
    let { selectedNodes = [],businessVal = [],appVal = [] ,relateid = []} = this.state
    if(!businessVal || businessVal.length === 0) {
      message.error('业务必选！')
      return
    }
    if(!appVal || appVal.length === 0) {
      message.error('应用必选！')
      return
    }
    if(!relateid || relateid.length === 0) {
      message.error('所属必选！')
      return
    }
    if(!selectedNodes || selectedNodes.length === 0) {
      message.error('节点必选！')
      return
    }
    let stringNodes = selectedNodes.join('，')
    const content = `确定要对当前时间的节点 ${stringNodes}, 进行实时诊断吗?`
    Modal.confirm({
      title: '提示',
      content,
      onOk: this.handleOk
    })
  }

  handleOk() {
    let { selectedNodes, report_type,businessVal, appVal} = this.state;
    const data = {
      nodes: selectedNodes,
      report_type,
      business_id:businessVal,
      app_id:appVal
    }
    if(this.props.onOk) {
      this.props.onOk(data)
    }
  }

  handleRadioChange(e) {
    this.setState({
      report_type: e.target.value
    })
  }
  changeBusinesses(value) {
    const id = value.split('-_-')[1];
    const relate = this.props.form.getFieldValue('relate')
    const {type} = relate
    // 清空其他已选项
    this.props.form.setFieldsValue({
      app_id: '',
      relate: {
        type: type,
        id: ''
      },
      node_id: []
    })

    if (this.props.clearRelate) {
      this.props.clearRelate()
    }

    if (this.props.getApps) {
      this.props.getApps(id)
    }
    this.setState({
      businessVal: id
    })

  }
  changeApp(value) {
    const appId = value.split('-_-')[1]

    const relate = this.props.form.getFieldValue('relate')
    const {type} = relate
    if (this.props.getRelateList) {

      this.props.getRelateList({
        type,
        data: {
          app_id: appId
        }
      })
    }
    // 清空服务
    this.props.form.setFieldsValue({
      // cluster_id : '',
      relate: {
        type: type,
        id: ''
      },
      app_id: '',
      node_id: []
    })
    this.setState({
      appVal: appId
    })
    /*if (this.props.clearService) {
      this.props.clearService()
    }*/
  }
  changeNode(value) {
    this.setState({
      selectedNodes: value,
    })
  }

  render(){
    const { visible, title, nodes, onCancel,appNodes,selectedBaseInfo ,form,relateList,node} = this.props
    const {getFieldDecorator} = form;
    const relateSelectProps = {
      relateList,
    }
    return (
      <Modal
        visible={visible}
        title={title}
        className={styles['modal']}
        onCancel={onCancel}
        onOk={this.makeSure}
      >
        <Row>
          <Col span="4">检查类型：</Col>
          <Col span="14">
            <RadioGroup onChange={this.handleRadioChange} value={this.state.report_type}>
              <Radio value="basic">基础</Radio>
              <Radio value="deep">深层次</Radio>
            </RadioGroup>
          </Col>
        </Row>
        <Form>
          <FormItem label="业务" {...formLayout} className={styles["select-container"]}>
            {getFieldDecorator('business_id', {
              initialValue: selectedBaseInfo.business_id,
              onChange: this.changeBusinesses.bind(this),
              rules: [{
                required: true,
                message: '业务必选'
              }]
            })(
              <Select placeholder="dfdfdfdfd">
                {
                  nodes && nodes.map(v => {
                    return <Option key={v.value} value={v.label + '-_-' + v.value}>
                      {v.label}
                    </Option>
                  })
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="应用" {...formLayout} className={styles["select-container"]}>
            {getFieldDecorator('app_id', {
              initialValue: selectedBaseInfo.app_id,
              onChange: this.changeApp.bind(this),
              rules: [{
                required: true,
                message: '应用必选'
              }]
            })(
              <Select>
                {
                  appNodes && appNodes.map(v => {
                    return <Option key={v.value} value={v.label + '-_-' + v.value}>
                      {v.label}
                    </Option>
                  })
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="所属" {...formLayout} className={styles["select-container"]}>
            {
              getFieldDecorator('relate', {
                initialValue: {
                  type: selectedBaseInfo.relateType,
                  id: selectedBaseInfo.relateId
                },
                onChange: this.changeRelate.bind(this),
                rules: [{
                  required: true,
                  message: '所属必填',
                }]
              })(
                <RelateSelect {...relateSelectProps}/>
              )
            }
          </FormItem>
          <FormItem label="节点" {...formLayout} className={styles["select-container"]}>
            {getFieldDecorator('node_id', {
              initialValue: [...selectedBaseInfo.node_id],
              onChange: this.changeNode.bind(this),
              rules: [{
                required: true,
                message: '应用必选'
              }]
            })(
              <Select
                mode="multiple"
              >
                {
                  node && node.map(v => {
                    return <Option key={v.value} value={v.label}>
                      {v.label}
                    </Option>
                  })
                }
              </Select>
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

ReportModal.propTypes = {
  visible: PropTypes.bool,
  onCancel : PropTypes.func,
  onOk : PropTypes.func,
  title: PropTypes.string,
  nodes: PropTypes.array,
  node: PropTypes.array,
  report_node:PropTypes.array,
  appNodes: PropTypes.array,
  clearService: PropTypes.func,
  setService: PropTypes.func,
}

export default Form.create()(ReportModal)
