/**
 * Created by Lizzy on 2018/3/27.
 */


import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger, TimeFilter, disabledDate } from 'utils'
import { DataTable, IconFont } from 'components'
import { Modal, Select, Form, Radio, DatePicker } from 'antd'
import styles from './index.less'
import RelateSelect from './relateSelect'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group
const RangePicker = DatePicker.RangePicker

const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 16,
  },
}

class ReportModal extends React.Component {
  constructor() {
    super()
    this.state = {
      radioValue: '0',  //巡检实例
      relateValue: '0',  //巡检所属
      relateText: '集群',
      business_id:'',
      app_id:'',
    }
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
    // this.props.getNodes(id,relateType)
  }
  changeRelateType(value) {
    const {form} = this.props
    const app = form.getFieldValue('app_id')
    if (!app) {
      return
    }
    const app_id = app.split('-_-')[1]
    const relateType = value.type
    if(relateType === '0'){
      this.setState({
        relateText: '集群',
      })
    }
    if(relateType === '1'){
      this.setState({
        relateText: '实例组'
      })
    }
    if(relateType === '2'){
      this.setState({
        relateText: '实例'
      })
    }
    if (this.props.getRelateList) {
      this.props.getRelateList({
        type: relateType,
        data: {
          app_id: app_id
        }
      })
    }
  }
  /*changeRelate(val) {
   /!* this.props.form.setFieldsValue({
    })*!/
    this.setState({
      relateValue:val.target.value
    },() =>{
      if(this.state.relateValue === '0'){
        this.setState({
          relateText: '集群'
        },()=>{
          if(this.state.relateValue === '0' && this.props.getCluster) {
            this.props.getCluster()
          }
        })
      }
      if(this.state.relateValue === '1'){
        this.setState({
          relateText: '实例'
        }, () => {
          if(this.state.relateValue === '1' && this.props.getInstance) {
            this.props.getInstance()
          }
        })
      }
      if(this.state.relateValue === '2'){
        this.setState({
          relateText: '实例组'
        },()=> {
          if(this.state.relateValue === '2' && this.props.getSet) {
            this.props.getSet()
          }
        })
      }

    })
  }*/

  changeBusinesses(value) {
    const id = value.split('-_-')[1];
    this.setState({
      business_id:id
    })

    const relate = this.props.form.getFieldValue('relate_switch')
    const {type} = relate
    // 清空其他已选项
    this.props.form.setFieldsValue({
      app_id: '',

    })

    if (this.props.getApps) {
      this.props.getApps(id)
    }

  }
  changeApp(value) {
    const appId = value.split('-_-')[1]
    this.setState({
      app_id:appId
    })
    const relate = this.props.form.getFieldValue('relate_switch')
    const {type} = relate
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

      app_id: '',

    })
  }
  render() {

    const { visible, onOk, onCancel, instances, buttonLoading, form ,clusters,sets,businesses,apps,selectedBaseInfo} = this.props
    const { getFieldDecorator, validateFields, getFieldsValue } = form
    const {business_id,app_id} = this.state
    //console.log("this.state.radioValue",this.state.radioValue)
    const modalOpts = {
      title: '执行节前巡检',
      visible,
      onOk: () => {
        validateFields((err, values) => {
          if (err) {
            return false
          }
          const data = {
            ...getFieldsValue()
          }
          data['business_id'] = business_id;
          data['app_id'] = app_id;
          if (this.state.radioValue === '0') {
            data['instance_names'] = []
          }
          if (this.state.radioValue === '1') {
            data['instance_names'] = data['select_instances']
          }
          if (this.state.radioValue === '2') {
            data['instance_names'] = data['deselect_instances']
          }
          // 获取到的是moment，需要转成string，再去掉时间; 接口格式是string而非数组
          // console.log(data['time_period'].map(v => TimeFilter.format(v / 1000).split(' ')[0]))
          const timePeriod = data['time_period'].map(v => TimeFilter.format(v / 1000).split(' ')[0])
          data['time_period'] = timePeriod.join(',')
          delete data['select_instances']
          delete data['deselect_instances']
          delete data['relate_switch']
          console.log(data)
          Modal.confirm({
            title: '提示',
            content: <p> 确定要生成 {timePeriod[0]} 到 {timePeriod[1]} 这一时间段的节前巡检报告吗？</p> ,
            confirmLoading:true,
            onOk: () => {
              onOk(data)
            },
            onCancel: () => { }
          })
        })
      },
      onCancel,
      wrapClassName: 'vertical-center-modal',
      // width: 'auto',
      // style: {maxWidth: '60%'},
    }

    const onRadioChange = (e) => {
      this.setState({
        radioValue: e.target.value,
      })
    }

    const checkSelectedInstances = (rule, value, callback) => {
      if (!value || value.length === instances.length) {
        callback([new Error('不能排除全部实例！')])
      }
      callback()
    }

    const label = <span>
      {
        '巡检' + this.state.relateText
      }
    </span>

    return (
      <Modal {...modalOpts} className={styles['sql-modal']}>
        <Form>
          <FormItem label="巡检时间段" hasFeedback {...formItemLayout}>
            {getFieldDecorator('time_period', {
              rules: [
                {
                  required: true,
                  message: '请选择巡检时间段',
                },
              ],
            })(
              <RangePicker disabledDate={disabledDate}/>
            )}
          </FormItem>
          <FormItem label="巡检业务" hasFeedback {...formItemLayout}>
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
              <Select>
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
          <FormItem label="巡检应用" hasFeedback {...formItemLayout}>
            {getFieldDecorator('app_id', {
              initialValue: selectedBaseInfo.app_id,
              onChange: this.changeApp.bind(this),
              rules: [
                {
                  required: true,
                  message: '应用必选',
                },
              ],
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
         {/* <FormItem label="巡检所属" {...formItemLayout}>
            {getFieldDecorator('relate_switch', {
              initialValue: '0',
              onChange: this.changeRelate.bind(this),
              rules: [
                {
                  required: true,
                  message: '请选择巡检实例',
                },
              ],
            })(
              <RadioGroup style={{margin: '4px 0'}}>
                <Radio value='0' >集群</Radio>
                <Radio value='1' >实例</Radio>
                <Radio value='2' >实例组</Radio>
              </RadioGroup>
            )}
          </FormItem>*/}
          <FormItem label="所属" {...formItemLayout} >
            {
              getFieldDecorator('relate_switch', {
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
                <RelateSelect />
              )
            }
          </FormItem>
          <FormItem label={label} {...formItemLayout}>
            {getFieldDecorator('instance_switch', {
              initialValue: '0',
              onChange: onRadioChange,
              rules: [
                {
                  required: true,
                  message: '请选择巡检实例',
                },
              ],
            })(
              <RadioGroup style={{margin: '4px 0', width: '100%'}}>
                <Radio value='0' style={{display: 'block', margin: '4px 0'}}>执行全部实例</Radio>
                <Radio value='1' style={{display: 'block', margin: '8px 0'}}>只执行以下实例</Radio>
                {
                    this.state.radioValue === '1' &&
                    <FormItem label="" hasFeedback {...formItemLayout}>
                      {getFieldDecorator('select_instances', {
                        rules: [
                          {
                            required: true,
                            message: '至少选择一个实例！',
                          },
                        ],
                      })(
                        <Select
                          mode = 'multiple'
                          style={{ width: '100%', margin: '4px 0' }}
                          placeholder="可输入关键词搜索实例"
                        >
                          {
                            instances && instances.map(v => {
                              return <Option key={v.value} value={v.label}>
                                {v.label}
                              </Option>
                            })

                          }
                        </Select>
                      )}
                    </FormItem>
                }
                <Radio value='2' style={{display: 'block', margin: '8px 0'}}>不执行以下实例</Radio>
                {
                  this.state.radioValue === '2' &&
                  <FormItem label="" hasFeedback {...formItemLayout}>
                    {getFieldDecorator('deselect_instances', {
                      rules: [
                        {
                          required: true,
                          message: '至少选择一个实例！',
                        },
                      ],
                    })(
                      <Select
                        mode = 'multiple'
                        style={{ width: '100%', margin: '4px 0' }}
                        placeholder="可输入关键词搜索实例"
                      >
                        {
                          instances && instances.map(v => {
                            return <Option key={v.value} value={v.label}>
                              {v.label}
                            </Option>
                          })

                        }
                      </Select>
                    )}
                  </FormItem>
                }
              </RadioGroup>
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
  buttonLoading: PropTypes.bool
}

export default Form.create()(ReportModal)
