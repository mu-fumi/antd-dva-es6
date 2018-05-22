/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-05 19:17 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger } from 'utils'
import { Form, InputNumber, Checkbox, Modal, Switch, Select, Input } from 'antd'
import _ from 'lodash'
import styles from './settingModal.less'

const FormItem = Form.Item
const Option = Select.Option

const formItemLayout = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 12,
  },
}

class SettingModal extends React.Component{

  render(){
    const {
      visible,
      settingData,
      title,
      onOk,
      onCancel,
      confirmLoading,
      form: {
        getFieldDecorator,
        validateFields,
        getFieldsValue,
        getFieldValue,
        setFieldsValue,
        resetFields
        },
      } = this.props


    const modalOpts = {
      title,
      visible,
      confirmLoading,
      onOk(e) {
        e.preventDefault();
        validateFields((err, values) => {
          if (err) {
            return false
          }
          const data = {
            ...getFieldsValue()
          }
          // console.log(data)
          if(onOk){
            onOk(data)
            resetFields()
          }
        })
      },
      onCancel(e){
        resetFields()
        if(onCancel){
          onCancel()
        }
      },
      //wrapClassName: 'vertical-center-modal',
    }
    let disableSwitch = !settingData.enable
    const handleSwitchChange = () => {  // 有this的时候可以用value
      disableSwitch = !getFieldValue("enable")
    }
    const modules = Object.keys(settingData.module || {})

    const nic_bandwidth = Object.keys(settingData.nic_bandwidth || {})


    // const init_nic =  _.isEmpty(settingData.using_nic) ? '' : Object.keys(settingData.using_nic)[0]
    // const init_bandwidth =  _.isEmpty(settingData.using_nic) ? '' : Object.values(settingData.using_nic)[0]

    const handleInterfaceChange = (value) => {  // 有this的时候可以用value
      const nic = value
      setFieldsValue ({
        bandwidth: settingData.nic_bandwidth[nic]
      })
    }

    // let nic_html = (() => {
    //   if(_.isEmpty(settingData.nic_bandwidth)){
    //     return <Input placeholder="请填写网卡" disabled={disableSwitch}/>
    //   }else{
    //     return  <Select disabled={disableSwitch}>
    //       <Option className="filter-select-option" key="xxxx" value="xxxx">xxxxx</Option>
    //     </Select>
    //   }
    // })()

    return (
      <Modal {...modalOpts}>
        <Form layout="horizontal">
          <FormItem label="启用配置" hasFeedback {...formItemLayout}>
            {getFieldDecorator('enable', {
              valuePropName: 'checked',
              initialValue: settingData.enable === 1,
              onChange: handleSwitchChange(),
              rules: [
                {
                  required: true,
                  message: '请选择是否启用配置',
                },
              ],
            })(
              <Switch/>
            )}
          </FormItem>
          <FormItem label="采集频率(单位:分钟)" hasFeedback {...formItemLayout}>
            {getFieldDecorator('update_interval', {
              initialValue: settingData.update_interval,
              rules: [
                {
                  required: true,
                  message: '请设置采集频率',
                },
              ],
            })(
              <InputNumber min={1} disabled={disableSwitch}/>
            )}
          </FormItem>
          { modules.length > 0 &&
            (<FormItem label="模块" {...formItemLayout}>
                { modules.map((v, k) =>{
                  return (
                    <FormItem key={k} hasFeedback wrapperCol={{span: 24}}>
                      {getFieldDecorator(v, {
                        valuePropName: 'checked',
                        initialValue: settingData.module[v].value,
                      })(
                        <Checkbox disabled={disableSwitch}>{ settingData.module[v].name }</Checkbox>
                      )}
                    </FormItem>
                  )
                })}
              </FormItem>)
          }
          <FormItem label="最佳查询响应时间(单位:ms)" hasFeedback {...formItemLayout}>
            {getFieldDecorator('optimum_query_res', {
              initialValue: settingData.optimum_query_res,
              rules: [
                {
                  required: true,
                  message: '请设置最佳查询响应时间',
                },
              ],
            })(
              <InputNumber min={1} disabled={disableSwitch}/>
            )}
          </FormItem>
          <FormItem label="可接受查询响应时间(单位:ms)" hasFeedback {...formItemLayout}>
            {getFieldDecorator('acceptable_query_res', {
              initialValue: settingData.acceptable_query_res,
              rules: [
                {
                  required: true,
                  message: '请设置可接受查询响应时间',
                },
              ],
            })(
              <InputNumber min={1} disabled={disableSwitch}/>
            )}
          </FormItem>
          <FormItem label="网卡" hasFeedback {...formItemLayout} className={styles['select']}>
            {getFieldDecorator('nic', {
              initialValue : _.isEmpty(settingData.using_nic) ? '' : Object.keys(settingData.using_nic)[0],
              onChange: _.isEmpty(settingData.nic_bandwidth) ? null : handleInterfaceChange.bind(this),
              rules: [
                {
                  required: true,
                  message: '请选择网卡',
                },
              ],
            })(
              _.isEmpty(settingData.nic_bandwidth)
                ? <Input placeholder="请填写网卡" disabled={disableSwitch}/>
                : <Select disabled={disableSwitch}>
                {nic_bandwidth.map((v, k) =>{
                  return <Option className="filter-select-option" key={k} value={v}>{v}</Option> })
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="网络带宽" hasFeedback {...formItemLayout}>
            {getFieldDecorator('bandwidth', {
              initialValue : _.isEmpty(settingData.using_nic) ? '' : Object.values(settingData.using_nic)[0],
              rules: [
                {
                  required: true,
                  message: '请设置网络带宽',
                },
              ],
            })(
              <InputNumber min={1} disabled={disableSwitch}/>
            )}
            <span>Mbps</span>
          </FormItem>
          <FormItem label="未提交事务时间阀值" hasFeedback {...formItemLayout}>
            {getFieldDecorator('uncommit_trx_line', {
              initialValue : settingData.uncommit_trx_line,
              rules: [
                {
                  required: true,
                  message: '请设置未提交事务时间阀值',
                },
              ],
            })(
              <InputNumber min={0} disabled={disableSwitch}/>
            )}
            <span>s</span>
          </FormItem>
          <FormItem label="执行时间阀值" hasFeedback {...formItemLayout}>
            {getFieldDecorator('execute_time_line', {
              initialValue : settingData.execute_time_line,
              rules: [
                {
                  required: true,
                  message: '请设置执行时间阀值',
                },
              ],
            })(
              <InputNumber min={0} disabled={disableSwitch}/>
            )}
            <span>s</span>
          </FormItem>
          <FormItem label="慢 SQL 阀值" hasFeedback {...formItemLayout}>
            {getFieldDecorator('long_query_time', {
              initialValue : settingData.long_query_time,
              rules: [
                {
                  required: true,
                  message: '请设置慢 SQL 阀值',
                },
              ],
            })(
              <InputNumber min={0} disabled={disableSwitch}/>
            )}
            <span>s</span>
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

SettingModal.propTypes = {
  visible: PropTypes.bool,
  title: PropTypes.string,
  form: PropTypes.object,
  settingData: PropTypes.object,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  confirmLoading: PropTypes.bool,
}

export default Form.create(
 //  {mapPropsToFields(props) {
 //  return {visible: props.visible, settingData: props.settingData}
 //}}
)(SettingModal)



