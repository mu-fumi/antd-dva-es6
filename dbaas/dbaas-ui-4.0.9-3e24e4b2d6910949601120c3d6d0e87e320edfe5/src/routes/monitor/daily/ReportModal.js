/**
 * Created by Lizzy on 2018/3/27.
 */


import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger, TimeFilter,constant } from 'utils'
import { DataTable, IconFont } from 'components'
import { Modal, Select, Form, Radio, DatePicker } from 'antd'
import styles from './index.less'
import RelateSelect from '../full/relateSelect'

const {REPORT_TYPE} = constant
const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const RangePicker = DatePicker.RangePicker

const formItemLayout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 12,
  },
}

class ReportModal extends React.Component {
  constructor() {
    super()
    this.state = {
      selectedNodes:[],
      business_id:'',
      app_id:'',
      report_type:REPORT_TYPE.DAILY_CHECK_TXT
    }
    this.changeRelate = this.changeRelate.bind(this)
    this.changeRelateType = this.changeRelateType.bind(this)
    this.changeRelateId = this.changeRelateId.bind(this)
  }

  changeBusinesses(value) {
    const id = value.split('-_-')[1];
    this.setState({
      business_id:id
    })
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

    if (this.props.getApps) {
      this.props.getApps(id)
    }

  }
  changeApp(value) {
    const appId = value.split('-_-')[1]
    const relate = this.props.form.getFieldValue('relate')
    const {type} = relate

    this.setState({
      app_id:appId
    })
    // aq根据所属类型与应用ID获取所属相关数据
   if(this.props.getRelateList) {
      this.props.getRelateList({
        type,
        data: {
          app_id: appId
        }
      })
    }
    // 清空数据
    this.props.form.setFieldsValue({
      relate: {
        type: type,
        id: ''
      },
      app_id: '',
      node_id: []
    })
  }
  changeRelate(value) {

    if (value.change === 'type') {
      this.changeRelateType(value)
    } else if (value.change === 'id') {
      this.changeRelateId(value)
    }
  }
  changeRelateId(value) {
    const relateId = value.id
    if (!relateId) {
      return
    }
    const id = relateId.split('-_-')[1]
    /****** 20180224 新增获取所属类型******/
    const relateType = value.type
    this.props.getNodes(id,relateType)
  }
  changeRelateType(value) {
    const {form} = this.props
    const app = form.getFieldValue('app_id')
    if (!app) {
      return
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
  changeNode(value) {
    this.setState({
      selectedNodes: value,
    })
  }
  render() {

    const { visible, onOk, onCancel, instances,selectedBaseInfo = {},
      buttonLoading, form,businesses,apps,relateList,nodes } = this.props
    const { getFieldDecorator, validateFields, getFieldsValue } = form
    const relateSelectProps = {
      relateList
    }
    const {selectedNodes,business_id,app_id,report_type} = this.state
    const modalOpts = {
      title: '生成巡检日报',
      visible,
      onOk: () => {
        validateFields((err, values) => {
          if (err) {
            return false
          }
         /* const data = {
            ...getFieldsValue()
          }*/
         const data = {
           nodes:selectedNodes,
           business_id,
           app_id,
           report_type
         }
          const stringNodes = selectedNodes.join('，')
          // const nodeNames = data['nodes'].map(v => instances[v])
          Modal.confirm({
            title: '提示',
            content: <p> 确定要对当前时间的节点 {stringNodes} 进行巡检并生成日报吗？</p> ,
            onOk: () => {
              onOk(data)
            },
            onCancel: () => { }
          })
        })
      },
      onCancel,
      wrapClassName: 'vertical-center-modal',
    }

    return (
      <Modal {...modalOpts}>
        <Form>
          <FormItem label="业务" {...formItemLayout}>
            {getFieldDecorator('business_id', {
              initialValue: selectedBaseInfo.business_id,
              onChange: this.changeBusinesses.bind(this),
              rules: [
                {
                  required: true,
                  message: '业务必选',
                },
              ],
            })(
              <Select
              >
                {
                  businesses && businesses.map(v => {
                    return <Option key={v.value} value={v.label + '-_-' + v.value}>
                      {v.label}
                    </Option>
                  })
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="应用" {...formItemLayout}>
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
                  apps && apps.map(v => {
                    return <Option key={v.value} value={v.label + '-_-' + v.value}>
                      {v.label}
                    </Option>
                  })
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="所属" {...formItemLayout} >
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
          <FormItem label="选择节点"  {...formItemLayout}>
            {getFieldDecorator('nodes', {
              onChange: this.changeNode.bind(this),
              rules: [
                {
                  required: true,
                  message: '请选择节点',
                },
              ],
            })(
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="节点，可输入关键词搜索"
               /* notFoundContent=""*/
              >
                {
                  nodes && nodes.map(v => {
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
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  form: PropTypes.object,
  businesses:PropTypes.array,
  apps:PropTypes.array,
  nodes:PropTypes.array,
  buttonLoading: PropTypes.bool
}

export default Form.create()(ReportModal)
